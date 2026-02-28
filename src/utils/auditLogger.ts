/**
 * Audit Logger for GDPR compliance and security monitoring.
 *
 * **Intelligence Perspective:** Audit trails enable accountability analysis and
 * access pattern intelligence—essential for data governance in political data systems.
 *
 * **Business Perspective:** GDPR audit compliance is a prerequisite for enterprise
 * customers and EU institutional partnerships requiring demonstrable data governance.
 *
 * **Marketing Perspective:** GDPR-compliant audit logging is a trust signal for
 * EU-focused customers and differentiates against non-compliant alternatives.
 *
 * ISMS Policy: AU-002 (Audit Logging and Monitoring), GDPR Articles 5, 17, 30
 *
 * Logs all access to personal data (MEP information) for audit trails
 * and regulatory compliance.
 *
 * @module utils/auditLogger
 * @since 0.8.0
 */

import type {
  AuditFilter,
  AuditLogEntry,
  AuditLoggerOptions,
  AuditSink,
  AuthToken,
} from './auditSink.js';
import {
  DEFAULT_SENSITIVE_KEYS,
  MemoryAuditSink,
  RetentionPolicy,
  sanitizeParams,
  StderrAuditSink,
} from './auditSink.js';

// Re-export the shared data model for backward compatibility.
export type { AuditLogEntry } from './auditSink.js';

// Re-export the pluggable-sink public API so consumers only need one import.
export type {
  AuditFilter,
  AuditLoggerOptions,
  AuditSink,
  AuthToken,
} from './auditSink.js';
export {
  DEFAULT_SENSITIVE_KEYS,
  FileAuditSink,
  MemoryAuditSink,
  RetentionPolicy,
  sanitizeParams,
  StderrAuditSink,
  StructuredJsonSink,
} from './auditSink.js';
export type { FileAuditSinkOptions } from './auditSink.js';

/**
 * Typed log levels for structured audit events.
 *
 * | Level   | Use case |
 * |---------|----------|
 * | `DEBUG` | Verbose trace information (dev only) |
 * | `INFO`  | Normal data-access events |
 * | `WARN`  | Recoverable anomalies |
 * | `ERROR` | Failed operations |
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Structured audit event used for MCP tool call tracking.
 *
 * Designed to be serialised to JSON for append-only log sinks
 * (CloudWatch, Elasticsearch, etc.).
 */
export interface AuditEvent {
  /** Severity level of the event */
  level: LogLevel;
  /** ISO-8601 timestamp */
  timestamp: string;
  /** Action / tool name */
  action: string;
  /** MCP tool name (if the event was triggered by a tool call) */
  toolName?: string;
  /** Sanitised tool input parameters */
  params?: Record<string, unknown>;
  /** Outcome metadata */
  result?: {
    count?: number;
    success: boolean;
    error?: string;
  };
  /** Wall-clock duration of the operation in milliseconds */
  duration?: number;
}

// ---------------------------------------------------------------------------
// AuditLogger
// ---------------------------------------------------------------------------

/**
 * GDPR-compliant audit logger with pluggable sinks, parameter sanitisation,
 * data retention enforcement, and access-controlled log retrieval.
 *
 * ## Pluggable sinks
 * By default the logger writes to an in-memory buffer (queryable via
 * `getLogs()`) and to `stderr` (MCP-compatible).  Pass a `sinks` option to
 * replace the default stderr sink with your own destinations
 * (e.g. `FileAuditSink`, `StructuredJsonSink`).
 *
 * ## Parameter sanitisation
 * All `params` objects are automatically sanitised before storage; keys
 * matching `sensitiveKeys` (default: `DEFAULT_SENSITIVE_KEYS`) are replaced
 * by `'[REDACTED]'` to prevent PII leakage into audit trails.
 *
 * ## Data retention
 * When `retentionMs` is set, `getLogs()` automatically filters out entries
 * older than the configured maximum age (GDPR Article 5(1)(e)).
 *
 * ## Access control
 * When `requiredAuthToken` is set, `getLogs()` and `eraseByUser()` throw if
 * the caller does not supply the correct token.
 *
 * @example Basic usage (backward-compatible)
 * ```typescript
 * auditLogger.logDataAccess('get_meps', { country: 'SE' }, 5, 85);
 * const entries = auditLogger.getLogs();
 * ```
 *
 * @example With file sink and 30-day retention
 * ```typescript
 * const requiredAuthToken = process.env['AUDIT_TOKEN'];
 * if (!requiredAuthToken) {
 *   throw new Error(
 *     'AUDIT_TOKEN environment variable must be set for audit log access control',
 *   );
 * }
 *
 * const logger = new AuditLogger({
 *   sinks: [new FileAuditSink({ filePath: '/var/log/ep-mcp-audit.ndjson' })],
 *   retentionMs: 30 * 24 * 60 * 60 * 1000,
 *   requiredAuthToken,
 * });
 * ```
 *
 * @since 0.8.0
 */
export class AuditLogger {
  private readonly memorySink: MemoryAuditSink;
  private readonly extraSinks: readonly AuditSink[];
  private readonly sensitiveKeys: readonly string[];
  private readonly retentionPolicy: RetentionPolicy | undefined;
  private readonly requiredAuthToken: AuthToken | undefined;

  constructor(options?: AuditLoggerOptions) {
    this.memorySink = new MemoryAuditSink();
    this.extraSinks = options?.sinks ?? [new StderrAuditSink()];
    this.sensitiveKeys = options?.sensitiveKeys ?? DEFAULT_SENSITIVE_KEYS;
    this.retentionPolicy =
      options?.retentionMs !== undefined
        ? new RetentionPolicy(options.retentionMs)
        : undefined;
    this.requiredAuthToken = options?.requiredAuthToken;
  }

  /**
   * Logs an audit event to the in-memory store and all configured sinks.
   *
   * Parameter values matching `sensitiveKeys` are automatically replaced by
   * `'[REDACTED]'` before storage.
   *
   * @param entry - Audit log entry without a timestamp (generated automatically)
   *
   * @security Writes to sinks only (not stdout, which is reserved for MCP).
   *   Per ISMS Policy AU-002, all MCP tool calls must be audit-logged.
   * @since 0.8.0
   */
  log(entry: Omit<AuditLogEntry, 'timestamp'>): void {
    const sanitized =
      entry.params !== undefined
        ? sanitizeParams(entry.params, this.sensitiveKeys)
        : undefined;
    const fullEntry: AuditLogEntry = {
      ...entry,
      ...(sanitized !== undefined ? { params: sanitized } : {}),
      timestamp: new Date(),
    };
    // Prune expired entries before writing to prevent unbounded memory growth
    // and ensure PII is not retained past the configured retention window
    // (GDPR Art. 5(1)(e) — Storage limitation principle).
    if (this.retentionPolicy !== undefined) {
      this.pruneExpiredEntries(this.retentionPolicy);
    }
    this.memorySink.write(fullEntry);
    this.writeSinks(fullEntry);
  }

  /**
   * Log an MCP tool call as an audit record.
   *
   * The tool's `params` are sanitised before being wrapped in the entry so
   * that PII nested inside tool parameters is redacted.
   *
   * @param toolName  - Name of the MCP tool that was invoked
   * @param params    - Tool input parameters (sanitised automatically)
   * @param success   - Whether the tool call completed without error
   * @param duration  - Optional wall-clock duration in milliseconds
   * @param error     - Optional error message if the call failed
   * @since 0.8.0
   */
  logToolCall(
    toolName: string,
    params: Record<string, unknown>,
    success: boolean,
    duration?: number,
    error?: string
  ): void {
    // Sanitize inner tool params before wrapping so that PII nested inside
    // tool parameters is redacted.  The outer log() call will also sanitize
    // the top-level params object, but the 'tool' key is not in sensitiveKeys,
    // so the already-sanitized inner params pass through unchanged.
    const sanitizedToolParams = sanitizeParams(params, this.sensitiveKeys);
    this.log({
      action: 'tool_call',
      params: { tool: { name: toolName, params: sanitizedToolParams } },
      result: {
        success,
        ...(error !== undefined && { error }),
      },
      ...(duration !== undefined && { duration }),
    });
  }

  /**
   * Logs a successful data-access event (e.g. a query returning records).
   *
   * @param action   - Action name (e.g. `'get_meps'`, `'get_committee_meetings'`)
   * @param params   - Query parameters (sanitised automatically)
   * @param count    - Number of records returned
   * @param duration - Optional wall-clock duration in milliseconds
   * @since 0.8.0
   */
  logDataAccess(
    action: string,
    params: Record<string, unknown>,
    count: number,
    duration?: number
  ): void {
    this.log({
      action,
      params,
      result: { count, success: true },
      ...(duration !== undefined && { duration }),
    });
  }

  /**
   * Logs a failed operation as an audit error event.
   *
   * @param action   - Action name
   * @param params   - Parameters supplied to the failed operation (sanitised)
   * @param error    - Human-readable error message (must not contain secrets)
   * @param duration - Optional wall-clock duration in milliseconds
   * @since 0.8.0
   */
  logError(
    action: string,
    params: Record<string, unknown>,
    error: string,
    duration?: number
  ): void {
    this.log({
      action,
      params,
      result: { success: false, error },
      ...(duration !== undefined && { duration }),
    });
  }

  /**
   * Returns a snapshot of all in-memory audit log entries, optionally filtered
   * by the configured data-retention policy.
   *
   * When `requiredAuthToken` was set in the constructor, `authorization` must
   * match; otherwise an `Error` is thrown.
   *
   * @param authorization - Authorization token (required when configured)
   * @returns Entries ordered oldest-first, filtered by retention policy
   *
   * @security When `requiredAuthToken` is configured, this method is access-
   *   controlled. Do not expose the returned entries through public APIs.
   * @since 0.8.0
   */
  getLogs(authorization?: AuthToken): AuditLogEntry[] {
    this.checkAuthorization(authorization);
    const entries = this.memorySink.query({});
    return this.retentionPolicy !== undefined
      ? this.retentionPolicy.enforce(entries)
      : entries;
  }

  /**
   * Queries the in-memory log using a filter.
   *
   * @param filter - Field-based filter to apply
   * @param authorization - Authorization token (required when configured)
   * @since 0.9.0
   */
  queryLogs(filter: AuditFilter, authorization?: AuthToken): AuditLogEntry[] {
    this.checkAuthorization(authorization);
    const entries = this.memorySink.query(filter);
    return this.retentionPolicy !== undefined
      ? this.retentionPolicy.enforce(entries)
      : entries;
  }

  /**
   * Removes all audit entries associated with `userId` from in-memory storage.
   *
   * **GDPR Article 17 — Right to Erasure.**  Only removes entries from the
   * in-memory `MemoryAuditSink`; entries already flushed to persistent sinks
   * (files, SIEM, etc.) must be erased separately via those sinks.
   *
   * @param userId       - The user whose entries should be erased
   * @param authorization - Authorization token (required when configured)
   * @since 0.9.0
   */
  eraseByUser(userId: string, authorization?: AuthToken): void {
    this.checkAuthorization(authorization);
    this.memorySink.eraseByUser(userId);
  }

  /**
   * Clears all in-memory audit log entries.
   *
   * **For testing only.** Clearing audit logs in production violates ISMS
   * Policy AU-002 and GDPR Article 30.
   *
   * @param authorization - Authorization token (required when configured)
   * @since 0.8.0
   */
  clear(authorization?: AuthToken): void {
    this.checkAuthorization(authorization);
    this.memorySink.clear('');
  }

  // --------------------------------------------------------------------------
  // Private helpers
  // --------------------------------------------------------------------------

  private checkAuthorization(authorization?: AuthToken): void {
    if (
      this.requiredAuthToken !== undefined &&
      authorization !== this.requiredAuthToken
    ) {
      throw new Error(
        'Unauthorized: missing or invalid authorization token'
      );
    }
  }

  private pruneExpiredEntries(policy: RetentionPolicy): void {
    const all = this.memorySink.query({});
    const fresh = all.filter((e): boolean => !policy.isExpired(e));

    // If nothing expired, avoid unnecessary buffer rebuild.
    if (fresh.length === all.length) {
      return;
    }

    // Rebuild the in-memory buffer with only non-expired entries.
    // This correctly handles users who have both fresh and expired entries —
    // their fresh entries are preserved while only expired ones are dropped.
    this.memorySink.clear('');
    for (const entry of fresh) {
      this.memorySink.write(entry);
    }
  }

  private writeSinks(entry: AuditLogEntry): void {
    for (const sink of this.extraSinks) {
      try {
        const result = sink.write(entry);
        if (result instanceof Promise) {
          // Fire-and-forget async sinks; surface errors to stderr so they are
          // observable without blocking the calling code path.
          void result.catch((err: unknown) => {
            console.error('[AuditLogger] Async sink write failed:', err);
          });
        }
      } catch (err: unknown) {
        // Ensure synchronous sink failures do not break the caller.
        console.error('[AuditLogger] Sync sink write failed:', err);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Global singleton
// ---------------------------------------------------------------------------

/**
 * Global audit logger instance.
 *
 * Uses default options: in-memory buffer + stderr output, no access control,
 * no retention policy.  Override by creating a new `AuditLogger` instance
 * with the desired {@link AuditLoggerOptions}.
 */
export const auditLogger = new AuditLogger();
