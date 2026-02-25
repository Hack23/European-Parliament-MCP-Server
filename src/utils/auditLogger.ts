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
   * Log an audit event
   * 
   * @param entry - Audit log entry
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
   * Log an MCP tool call audit event.
   *
   * Emits a structured {@link AuditEvent} record that includes tool name,
   * sanitised parameters, and outcome.  Suitable for GDPR Article 30
   * processing-activity records.
   *
   * @param toolName  - Name of the MCP tool that was invoked
   * @param params    - Tool input parameters. **Callers are responsible for
   *                    sanitising sensitive values before passing them here.**
   *                    This method does not perform any sanitisation.
   * @param success   - Whether the tool call completed without error
   * @param duration  - Optional wall-clock duration in milliseconds
   * @param error     - Optional error message if the call failed
   */
  logToolCall(
    toolName: string,
    params: Record<string, unknown>,
    success: boolean,
    duration?: number,
    error?: string
  ): void {
    const event: AuditEvent = {
      level: success ? LogLevel.INFO : LogLevel.ERROR,
      timestamp: new Date().toISOString(),
      action: 'tool_call',
      toolName,
      params,
      result: {
        success,
        ...(error !== undefined && { error }),
      },
      ...(duration !== undefined && { duration }),
    };

    // Persist via the existing internal log path so getLogs() captures it.
    // Tool-call data is nested under the 'tool' key to prevent user-controlled
    // param keys from colliding with reserved log schema fields.
    this.log({
      action: event.action,
      params: { tool: { name: toolName, params } },
      result: {
        success,
        ...(error !== undefined && { error }),
      },
      ...(duration !== undefined && { duration }),
    });

    // Emit the richer structured event to stderr as well
    console.error('[AUDIT:TOOL]', JSON.stringify(event));
  }

  /**
   * Log a successful data access
   * 
   * @param action - Action name
   * @param params - Action parameters
   * @param count - Number of records accessed
   * @param duration - Optional operation duration in milliseconds
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
   * Log a failed operation
   * 
   * @param action - Action name
   * @param params - Action parameters
   * @param error - Error message
   * @param duration - Optional operation duration in milliseconds
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
   * Get audit logs (for testing/debugging)
   */
  getLogs(): AuditLogEntry[] {
    return [...this.logs];
  }
  
  /**
   * Clear audit logs (for testing only)
   */
  clear(): void {
    this.logs = [];
  }
}

/**
 * Global audit logger instance
 */
export const auditLogger = new AuditLogger();
