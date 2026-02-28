/**
 * Audit sink interface and implementations for pluggable log output.
 *
 * **Intelligence Perspective:** Pluggable sinks enable routing audit trails to
 * centralised SIEM platforms, improving threat-detection fidelity.
 *
 * **Business Perspective:** Durable audit storage is a prerequisite for
 * enterprise customers requiring demonstrable GDPR Article 30 compliance.
 *
 * **Marketing Perspective:** Configurable audit sinks differentiate against
 * solutions that only log to stderr with no persistence option.
 *
 * ISMS Policy: AU-002 (Audit Logging and Monitoring), GDPR Articles 5, 17, 30
 *
 * @module utils/auditSink
 * @since 0.9.0
 */

import { appendFile, rename, stat } from 'node:fs/promises';

// ---------------------------------------------------------------------------
// Core data model
// ---------------------------------------------------------------------------

/**
 * Represents a single audited operation and its contextual metadata.
 *
 * Designed for serialisation to append-only log sinks.
 */
export interface AuditLogEntry {
  /** Timestamp of the event */
  timestamp: Date;
  /** Action performed (e.g. `'get_meps'`, `'tool_call'`) */
  action: string;
  /** Sanitised parameters used in the action */
  params?: Record<string, unknown>;
  /** Outcome metadata */
  result?: {
    count?: number;
    success: boolean;
    error?: string;
  };
  /** Wall-clock duration of the operation in milliseconds */
  duration?: number;
  /** User identifier (if authenticated) */
  userId?: string;
  /** Client identifier */
  clientId?: string;
  /** IP address (for security monitoring) */
  ipAddress?: string;
}

// ---------------------------------------------------------------------------
// Query / access-control types
// ---------------------------------------------------------------------------

/**
 * Filter for querying audit log entries.
 */
export interface AuditFilter {
  /** Restrict to a specific action name */
  action?: string;
  /** Include only entries on or after this date */
  since?: Date;
  /** Include only entries on or before this date */
  until?: Date;
  /** Restrict to a specific user ID */
  userId?: string;
}

/**
 * Authorization token for privileged audit operations such as
 * `getLogs()` and `eraseByUser()`.
 *
 * @security Must be kept secret; treat as a capability key.
 */
export type AuthToken = string;

// ---------------------------------------------------------------------------
// Sink interface
// ---------------------------------------------------------------------------

/**
 * Pluggable audit sink interface.
 *
 * Implement this to create custom log destinations (files, SIEM, syslog …).
 *
 * @example
 * ```typescript
 * class MyCustomSink implements AuditSink {
 *   write(entry: AuditLogEntry): void {
 *     myExternalSystem.send(entry);
 *   }
 * }
 * ```
 */
export interface AuditSink {
  /** Write a single audit entry to the sink */
  write(entry: AuditLogEntry): void | Promise<void>;
  /**
   * Query entries matching a filter.
   * Implemented by in-memory sinks; write-only sinks omit this.
   */
  query?(filter: AuditFilter): AuditLogEntry[];
  /**
   * Clear all entries, optionally gated by an authorization token.
   * Implemented by in-memory sinks; write-only sinks omit this.
   */
  clear?(authorization: AuthToken): void;
}

// ---------------------------------------------------------------------------
// AuditLogger constructor options
// ---------------------------------------------------------------------------

/**
 * Constructor options for {@link AuditLogger}.
 */
export interface AuditLoggerOptions {
  /**
   * Extra write-only sinks (e.g. `FileAuditSink`, `StructuredJsonSink`).
   * Replaces the default `StderrAuditSink` when provided.
   */
  sinks?: AuditSink[];
  /** Maximum age of log entries in milliseconds (data retention enforcement) */
  retentionMs?: number;
  /**
   * Authorization token required to call `getLogs()`, `queryLogs()`,
   * `clear()`, and `eraseByUser()`.
   * When absent, those methods are unrestricted (suitable for testing).
   */
  requiredAuthToken?: AuthToken;
  /**
   * Top-level parameter keys treated as PII and redacted to `'[REDACTED]'`.
   * Defaults to {@link DEFAULT_SENSITIVE_KEYS}.
   */
  sensitiveKeys?: readonly string[];
}

// ---------------------------------------------------------------------------
// Parameter sanitisation
// ---------------------------------------------------------------------------

/**
 * Default set of top-level parameter keys treated as personally identifiable
 * information (PII) and redacted before storage.
 */
export const DEFAULT_SENSITIVE_KEYS: readonly string[] = [
  'name',
  'email',
  'fullName',
  'address',
  'firstName',
  'lastName',
  'phone',
];

/**
 * Returns a copy of `params` with sensitive values replaced by `'[REDACTED]'`.
 *
 * Only **top-level** keys are inspected. Nested objects are passed through
 * unchanged, so callers should sanitise nested params separately if needed.
 *
 * @param params - Original parameter map
 * @param sensitiveKeys - Keys to redact (defaults to {@link DEFAULT_SENSITIVE_KEYS})
 * @returns Sanitised copy of `params`
 *
 * @security This function does NOT recurse into nested objects.
 *   Callers are responsible for sanitising nested parameter structures.
 * @since 0.9.0
 */
export function sanitizeParams(
  params: Record<string, unknown>,
  sensitiveKeys: readonly string[] = DEFAULT_SENSITIVE_KEYS
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]): [string, unknown] => [
      key,
      sensitiveKeys.includes(key) ? '[REDACTED]' : value,
    ])
  );
}

// ---------------------------------------------------------------------------
// Data retention
// ---------------------------------------------------------------------------

/**
 * Enforces a configurable data-retention window by filtering out expired entries.
 *
 * GDPR Article 5(1)(e) — Storage limitation principle.
 *
 * @example
 * ```typescript
 * const policy = new RetentionPolicy(30 * 24 * 60 * 60 * 1000); // 30 days
 * const fresh = policy.enforce(auditLogger.getLogs());
 * ```
 * @since 0.9.0
 */
export class RetentionPolicy {
  constructor(private readonly maxAgeMs: number) {}

  /**
   * Returns only entries whose timestamp is within the retention window.
   */
  enforce(entries: AuditLogEntry[]): AuditLogEntry[] {
    const cutoff = Date.now() - this.maxAgeMs;
    return entries.filter((e): boolean => e.timestamp.getTime() >= cutoff);
  }

  /**
   * Returns `true` if the given entry has exceeded the retention period.
   */
  isExpired(entry: AuditLogEntry): boolean {
    return Date.now() - entry.timestamp.getTime() > this.maxAgeMs;
  }
}

// ---------------------------------------------------------------------------
// MemoryAuditSink
// ---------------------------------------------------------------------------

/**
 * In-memory audit sink.
 *
 * Buffers entries in a private array and supports querying and per-user
 * erasure (GDPR Article 17 — Right to Erasure).
 *
 * @since 0.9.0
 */
export class MemoryAuditSink implements AuditSink {
  private entries: AuditLogEntry[] = [];

  /** Appends the entry to the internal buffer. */
  write(entry: AuditLogEntry): void {
    this.entries.push(entry);
  }

  /** Returns entries matching the supplied filter. */
  query(filter: AuditFilter): AuditLogEntry[] {
    return this.entries.filter((e): boolean => this.matchesFilter(e, filter));
  }

  /** Clears the internal buffer (the `authorization` param is accepted but unused). */
  clear(_authorization: AuthToken): void {
    this.entries = [];
  }

  /**
   * Removes all entries associated with `userId`.
   *
   * GDPR Article 17 — Right to Erasure.
   */
  eraseByUser(userId: string): void {
    this.entries = this.entries.filter((e): boolean => e.userId !== userId);
  }

  private matchesFilter(entry: AuditLogEntry, filter: AuditFilter): boolean {
    if (filter.action !== undefined && entry.action !== filter.action) {
      return false;
    }
    if (filter.since !== undefined && entry.timestamp < filter.since) {
      return false;
    }
    if (filter.until !== undefined && entry.timestamp > filter.until) {
      return false;
    }
    if (filter.userId !== undefined && entry.userId !== filter.userId) {
      return false;
    }
    return true;
  }
}

// ---------------------------------------------------------------------------
// StderrAuditSink
// ---------------------------------------------------------------------------

/**
 * Writes structured JSON audit lines to `stderr`.
 *
 * MCP-compatible: `stdout` is reserved for the MCP protocol wire format.
 *
 * @since 0.9.0
 */
export class StderrAuditSink implements AuditSink {
  write(entry: AuditLogEntry): void {
    console.error('[AUDIT]', JSON.stringify(entry));
  }
}

// ---------------------------------------------------------------------------
// FileAuditSink
// ---------------------------------------------------------------------------

/**
 * Constructor options for {@link FileAuditSink}.
 */
export interface FileAuditSinkOptions {
  /** Absolute path to the NDJSON log file */
  filePath: string;
  /** Maximum file size in bytes before log rotation (default: 10 MiB) */
  maxSizeBytes?: number;
}

/**
 * Appends audit entries as newline-delimited JSON (NDJSON) to a file.
 *
 * **Log rotation:** when the file reaches `maxSizeBytes`, it is renamed to
 * `<filePath>.<timestamp>.bak` before the new entry is written.
 *
 * @security The log file should be stored on a volume with restricted write
 *   permissions; only the server process account should have write access.
 * @since 0.9.0
 */
export class FileAuditSink implements AuditSink {
  private readonly filePath: string;
  private readonly maxSizeBytes: number;
  /**
   * Serialises concurrent write calls so that stat + rename + appendFile
   * sequences never interleave across parallel `log()` invocations.
   */
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(options: FileAuditSinkOptions) {
    this.filePath = options.filePath;
    this.maxSizeBytes = options.maxSizeBytes ?? 10 * 1024 * 1024;
  }

  write(entry: AuditLogEntry): Promise<void> {
    // Chain each write onto the tail of the previous one so concurrent callers
    // are serialised — preventing interleaved stat/rename/append sequences.
    // Swap `writeQueue` to a promise that always resolves (never rejects) so
    // the next enqueued write is not blocked after a prior write failure.
    const next = this.writeQueue.then(async (): Promise<void> => {
      await this.rotateIfNeeded();
      await appendFile(this.filePath, `${JSON.stringify(entry)}\n`, 'utf8');
    });
    // Always keep `writeQueue` as a resolved promise for the next caller;
    // propagate the actual error only through the returned `next` promise.
    this.writeQueue = next.then(
      (): void => { /* success — queue stays resolved */ },
      (): void => { /* failure — reset queue to resolved so next write proceeds */ }
    );
    return next;
  }

  private async rotateIfNeeded(): Promise<void> {
    try {
      const stats = await stat(this.filePath);
      if (stats.size >= this.maxSizeBytes) {
        await rename(
          this.filePath,
          `${this.filePath}.${String(Date.now())}.bak`
        );
      }
    } catch (error: unknown) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'ENOENT') {
        // File does not exist yet — no rotation needed.
        return;
      }
      // Surface unexpected errors (permissions, EBUSY, disk errors, etc.)
      // so rotation failures are observable rather than silently swallowed.
      console.error('[FileAuditSink] Failed to rotate audit log file:', err);
      throw err;
    }
  }
}

// ---------------------------------------------------------------------------
// StructuredJsonSink
// ---------------------------------------------------------------------------

/**
 * Serialises each audit entry to JSON and passes it to a writer callback.
 *
 * Suitable for forwarding to structured log aggregators such as
 * AWS CloudWatch, Elasticsearch, or Splunk.
 *
 * @example
 * ```typescript
 * const sink = new StructuredJsonSink((json) => cloudwatch.putLogEvent(json));
 * const logger = new AuditLogger({ sinks: [sink] });
 * ```
 * @since 0.9.0
 */
export class StructuredJsonSink implements AuditSink {
  private readonly writer: (json: string) => void;

  constructor(writer?: (json: string) => void) {
    this.writer = writer ?? ((json: string): void => {
      console.error('[AUDIT]', json);
    });
  }

  write(entry: AuditLogEntry): void {
    this.writer(JSON.stringify(entry));
  }
}
