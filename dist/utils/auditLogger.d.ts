/**
 * Audit Logger for GDPR compliance and security monitoring
 *
 * ISMS Policy: AU-002 (Audit Logging and Monitoring), GDPR Article 30
 *
 * Logs all access to personal data (MEP information) for audit trails
 * and regulatory compliance.
 */
/**
 * Audit log entry structure
 * @internal - Used only within AuditLogger implementation
 */
interface AuditLogEntry {
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
export declare class AuditLogger {
    private logs;
    /**
     * Log an audit event
     *
     * @param entry - Audit log entry
     */
    log(entry: Omit<AuditLogEntry, 'timestamp'>): void;
    /**
     * Log a successful data access
     *
     * @param action - Action name
     * @param params - Action parameters
     * @param count - Number of records accessed
     * @param duration - Optional operation duration in milliseconds
     */
    logDataAccess(action: string, params: Record<string, unknown>, count: number, duration?: number): void;
    /**
     * Log a failed operation
     *
     * @param action - Action name
     * @param params - Action parameters
     * @param error - Error message
     * @param duration - Optional operation duration in milliseconds
     */
    logError(action: string, params: Record<string, unknown>, error: string, duration?: number): void;
    /**
     * Get audit logs (for testing/debugging)
     */
    getLogs(): AuditLogEntry[];
    /**
     * Clear audit logs (for testing only)
     */
    clear(): void;
}
/**
 * Global audit logger instance
 */
export declare const auditLogger: AuditLogger;
export {};
//# sourceMappingURL=auditLogger.d.ts.map