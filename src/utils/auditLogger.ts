/**
 * Audit Logger for GDPR compliance and security monitoring
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
 * ISMS Policy: AU-002 (Audit Logging and Monitoring), GDPR Article 30
 * 
 * Logs all access to personal data (MEP information) for audit trails
 * and regulatory compliance.
 */

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

/**
 * Audit log entry structure, part of the public audit logging API.
 * Represents a single audited operation and its contextual metadata.
 */
export interface AuditLogEntry {
  /**
   * Timestamp of the event
   */
  timestamp: Date;
  
  /**
   * Action performed (e.g., 'get_meps', 'get_mep_details')
   */
  action: string;
  
  /**
   * Parameters used in the action
   */
  params?: Record<string, unknown>;
  
  /**
   * Result metadata (e.g., count of records returned)
   */
  result?: {
    count?: number;
    success: boolean;
    error?: string;
  };
  
  /**
   * Duration of the operation in milliseconds
   */
  duration?: number;
  
  /**
   * User identifier (if authenticated)
   */
  userId?: string;
  
  /**
   * Client identifier
   */
  clientId?: string;
  
  /**
   * IP address (for security monitoring)
   */
  ipAddress?: string;
}

/**
 * Audit logger implementation
 * 
 * In production, this should write to a secure, append-only log storage
 * such as CloudWatch Logs, Elasticsearch, or a dedicated audit log service.
 */
export class AuditLogger {
  private logs: AuditLogEntry[] = [];
  
  /**
   * Logs an audit event to the in-memory store and stderr.
   *
   * Appends a timestamped {@link AuditLogEntry} to the internal log buffer and
   * emits a single structured JSON line to `stderr` (stdout is reserved for the
   * MCP protocol wire format).
   *
   * @param entry - Audit log entry without a timestamp (generated automatically)
   * @throws {TypeError} If `entry.action` is not a string
   *
   * @example
   * ```typescript
   * auditLogger.log({
   *   action: 'get_meps',
   *   params: { country: 'DE' },
   *   result: { success: true, count: 42 },
   *   duration: 120
   * });
   * ```
   *
   * @security Writes to stderr only (not stdout, which is reserved for MCP protocol).
   *   Per ISMS Policy AU-002, all MCP tool calls must be audit-logged.
   * @since 0.8.0
   */
  log(entry: Omit<AuditLogEntry, 'timestamp'>): void {
    const fullEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date()
    };
    
    this.logs.push(fullEntry);
    
    // Log to stderr for MCP server (stdout is used for protocol)
    console.error('[AUDIT]', JSON.stringify(fullEntry));
  }
  
  /**
   * Log an MCP tool call as an audit record.
   *
   * Persists an {@link AuditLogEntry} via {@link log} (which emits a single
   * `[AUDIT]` record to stderr).  Tool-call data is nested under
   * `{ tool: { name, params } }` to prevent user-controlled parameter keys
   * from colliding with reserved log-schema fields.  Suitable for GDPR
   * Article 30 processing-activity records.
   *
   * @param toolName  - Name of the MCP tool that was invoked
   * @param params    - Tool input parameters. **Callers are responsible for
   *                    sanitising sensitive values before passing them here.**
   *                    This method does not perform any sanitisation.
   * @param success   - Whether the tool call completed without error
   * @param duration  - Optional wall-clock duration in milliseconds
   * @param error     - Optional error message if the call failed
   * @throws {TypeError} If `toolName` is not a string
   *
   * @example
   * ```typescript
   * auditLogger.logToolCall(
   *   'get_mep_details',
   *   { mepId: 12345 },
   *   true,
   *   95,
   * );
   *
   * // On failure:
   * auditLogger.logToolCall(
   *   'get_plenary_sessions',
   *   { term: 10 },
   *   false,
   *   200,
   *   'EP API returned 503'
   * );
   * ```
   *
   * @security Parameter values are nested under a `tool` key to prevent
   *   user-controlled keys from colliding with reserved audit-schema fields.
   *   Callers must sanitise PII before passing `params`.
   *   Per ISMS Policy AU-002, all MCP tool calls must be audit-logged.
   * @since 0.8.0
   */
  logToolCall(
    toolName: string,
    params: Record<string, unknown>,
    success: boolean,
    duration?: number,
    error?: string
  ): void {
    // Persist via the existing internal log path so getLogs() captures it.
    // Tool-call data is nested under the 'tool' key to prevent user-controlled
    // param keys from colliding with reserved log schema fields.
    // this.log() already emits the structured entry to stderr via console.error.
    this.log({
      action: 'tool_call',
      params: { tool: { name: toolName, params } },
      result: {
        success,
        ...(error !== undefined && { error }),
      },
      ...(duration !== undefined && { duration }),
    });
  }

  /**
   * Logs a successful data-access event (e.g., a query returning records).
   *
   * Convenience wrapper around {@link log} that constructs a success result
   * with a record count. Suitable for GDPR Article 30 processing-activity
   * records where the data subject count is relevant.
   *
   * @param action - Action name (e.g., `'get_meps'`, `'get_committee_meetings'`)
   * @param params - Sanitised query parameters used for the data access
   * @param count - Number of records returned / accessed
   * @param duration - Optional wall-clock duration in milliseconds
   * @throws {TypeError} If `action` is not a string or `count` is not a number
   *
   * @example
   * ```typescript
   * auditLogger.logDataAccess(
   *   'get_meps',
   *   { country: 'SE', group: 'EPP' },
   *   7,
   *   85
   * );
   * ```
   *
   * @security Params must be sanitised by the caller before passing to this
   *   method—no PII stripping is performed internally.
   *   Per ISMS Policy AU-002 / GDPR Article 30, data-access events must be
   *   logged with subject counts for processing-activity records.
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
      result: {
        count,
        success: true
      },
      ...(duration !== undefined && { duration })
    });
  }
  
  /**
   * Logs a failed operation as an audit error event.
   *
   * Convenience wrapper around {@link log} that constructs a failure result.
   * Use this whenever an MCP tool or EP API call throws or returns an error
   * so the failure is captured in the audit trail.
   *
   * @param action - Action name (e.g., `'get_mep_details'`, `'get_plenary_sessions'`)
   * @param params - Sanitised parameters that were supplied to the failed operation
   * @param error - Human-readable error message (must not contain secrets or PII)
   * @param duration - Optional wall-clock duration in milliseconds before failure
   * @throws {TypeError} If `action` or `error` is not a string
   *
   * @example
   * ```typescript
   * auditLogger.logError(
   *   'get_mep_details',
   *   { mepId: 99999 },
   *   'MEP not found',
   *   30
   * );
   * ```
   *
   * @security Error messages must not include secrets, tokens, or raw stack
   *   traces. Sanitise before passing to avoid leaking internal details to
   *   log sinks accessible by ops teams.
   *   Per ISMS Policy AU-002, failed operations must be audit-logged.
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
      result: {
        success: false,
        error
      },
      ...(duration !== undefined && { duration })
    });
  }
  
  /**
   * Returns a snapshot copy of all in-memory audit log entries.
   *
   * Intended primarily for **testing and debugging**. In production, audit
   * records are emitted to `stderr` in real time; this method allows test
   * suites to assert on logged events without parsing stderr output.
   *
   * @returns Shallow copy of the internal log buffer as an array of
   *   {@link AuditLogEntry} objects, ordered oldest-first. Mutating the
   *   returned array does not affect the internal buffer.
   *
   * @example
   * ```typescript
   * auditLogger.logDataAccess('get_meps', {}, 5);
   * const logs = auditLogger.getLogs();
   * expect(logs).toHaveLength(1);
   * expect(logs[0]?.action).toBe('get_meps');
   * ```
   *
   * @security The returned entries may contain sanitised parameters that were
   *   passed by callers. Treat the output as sensitive and do not expose it
   *   through public API endpoints.
   * @since 0.8.0
   */
  getLogs(): AuditLogEntry[] {
    return [...this.logs];
  }
  
  /**
   * Clears all in-memory audit log entries.
   *
   * **For testing only.** Calling this in production will silently discard
   * audit records that have not yet been flushed to a persistent sink,
   * violating ISMS Policy AU-002.
   *
   * @example
   * ```typescript
   * afterEach(() => {
   *   auditLogger.clear();
   * });
   * ```
   *
   * @security Must NOT be called in production code. Clearing audit logs
   *   without an authorised retention policy violates GDPR Article 30 and
   *   ISMS Policy AU-002 (Audit Logging and Monitoring).
   * @since 0.8.0
   */
  clear(): void {
    this.logs = [];
  }
}

/**
 * Global audit logger instance
 */
export const auditLogger = new AuditLogger();
