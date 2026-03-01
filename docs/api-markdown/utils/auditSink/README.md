[**European Parliament MCP Server API v1.0.0**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / utils/auditSink

# utils/auditSink

Audit sink interface and implementations for pluggable log output.

**Intelligence Perspective:** Pluggable sinks enable routing audit trails to
centralised SIEM platforms, improving threat-detection fidelity.

**Business Perspective:** Durable audit storage is a prerequisite for
enterprise customers requiring demonstrable GDPR Article 30 compliance.

**Marketing Perspective:** Configurable audit sinks differentiate against
solutions that only log to stderr with no persistence option.

ISMS Policy: AU-002 (Audit Logging and Monitoring), GDPR Articles 5, 17, 30

## Since

0.9.0

## Classes

- [FileAuditSink](classes/FileAuditSink.md)
- [MemoryAuditSink](classes/MemoryAuditSink.md)
- [RetentionPolicy](classes/RetentionPolicy.md)
- [StderrAuditSink](classes/StderrAuditSink.md)
- [StructuredJsonSink](classes/StructuredJsonSink.md)

## Interfaces

- [AuditFilter](interfaces/AuditFilter.md)
- [AuditLogEntry](interfaces/AuditLogEntry.md)
- [AuditLoggerOptions](interfaces/AuditLoggerOptions.md)
- [AuditSink](interfaces/AuditSink.md)
- [FileAuditSinkOptions](interfaces/FileAuditSinkOptions.md)

## Type Aliases

- [AuthToken](type-aliases/AuthToken.md)

## Variables

- [DEFAULT\_SENSITIVE\_KEYS](variables/DEFAULT_SENSITIVE_KEYS.md)

## Functions

- [sanitizeParams](functions/sanitizeParams.md)
