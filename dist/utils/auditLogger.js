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
 * Audit logger implementation
 *
 * In production, this should write to a secure, append-only log storage
 * such as CloudWatch Logs, Elasticsearch, or a dedicated audit log service.
 */
export class AuditLogger {
    logs = [];
    /**
     * Log an audit event
     *
     * @param entry - Audit log entry
     */
    log(entry) {
        const fullEntry = {
            ...entry,
            timestamp: new Date()
        };
        this.logs.push(fullEntry);
        // Log to stderr for MCP server (stdout is used for protocol)
        console.error('[AUDIT]', JSON.stringify(fullEntry));
    }
    /**
     * Log a successful data access
     *
     * @param action - Action name
     * @param params - Action parameters
     * @param count - Number of records accessed
     * @param duration - Optional operation duration in milliseconds
     */
    logDataAccess(action, params, count, duration) {
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
    logError(action, params, error, duration) {
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
    getLogs() {
        return [...this.logs];
    }
    /**
     * Clear audit logs (for testing only)
     */
    clear() {
        this.logs = [];
    }
}
/**
 * Global audit logger instance
 */
export const auditLogger = new AuditLogger();
//# sourceMappingURL=auditLogger.js.map