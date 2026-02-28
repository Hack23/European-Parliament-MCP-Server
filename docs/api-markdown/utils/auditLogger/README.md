[**European Parliament MCP Server API v1.0.0**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / utils/auditLogger

# utils/auditLogger

Audit Logger for GDPR compliance and security monitoring.

**Intelligence Perspective:** Audit trails enable accountability analysis and
access pattern intelligence—essential for data governance in political data systems.

**Business Perspective:** GDPR audit compliance is a prerequisite for enterprise
customers and EU institutional partnerships requiring demonstrable data governance.

**Marketing Perspective:** GDPR-compliant audit logging is a trust signal for
EU-focused customers and differentiates against non-compliant alternatives.

ISMS Policy: AU-002 (Audit Logging and Monitoring), GDPR Articles 5, 17, 30

Logs all access to personal data (MEP information) for audit trails
and regulatory compliance.

## Since

0.8.0

## Enumerations

- [LogLevel](enumerations/LogLevel.md)

## Classes

- [AuditLogger](classes/AuditLogger.md)

## Interfaces

- [AuditEvent](interfaces/AuditEvent.md)

## Variables

- [auditLogger](variables/auditLogger.md)

## Functions

- [toErrorMessage](functions/toErrorMessage.md)

## References

### AuditFilter

Re-exports [AuditFilter](../auditSink/interfaces/AuditFilter.md)

***

### AuditLogEntry

Re-exports [AuditLogEntry](../auditSink/interfaces/AuditLogEntry.md)

***

### AuditLoggerOptions

Re-exports [AuditLoggerOptions](../auditSink/interfaces/AuditLoggerOptions.md)

***

### AuditSink

Re-exports [AuditSink](../auditSink/interfaces/AuditSink.md)

***

### AuthToken

Re-exports [AuthToken](../auditSink/type-aliases/AuthToken.md)

***

### DEFAULT\_SENSITIVE\_KEYS

Re-exports [DEFAULT_SENSITIVE_KEYS](../auditSink/variables/DEFAULT_SENSITIVE_KEYS.md)

***

### FileAuditSink

Re-exports [FileAuditSink](../auditSink/classes/FileAuditSink.md)

***

### FileAuditSinkOptions

Re-exports [FileAuditSinkOptions](../auditSink/interfaces/FileAuditSinkOptions.md)

***

### MemoryAuditSink

Re-exports [MemoryAuditSink](../auditSink/classes/MemoryAuditSink.md)

***

### RetentionPolicy

Re-exports [RetentionPolicy](../auditSink/classes/RetentionPolicy.md)

***

### sanitizeParams

Re-exports [sanitizeParams](../auditSink/functions/sanitizeParams.md)

***

### StderrAuditSink

Re-exports [StderrAuditSink](../auditSink/classes/StderrAuditSink.md)

***

### StructuredJsonSink

Re-exports [StructuredJsonSink](../auditSink/classes/StructuredJsonSink.md)
