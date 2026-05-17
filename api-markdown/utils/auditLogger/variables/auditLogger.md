[**European Parliament MCP Server API v1.3.7**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/auditLogger](../README.md) / auditLogger

# Variable: auditLogger

> `const` **auditLogger**: [`AuditLogger`](../classes/AuditLogger.md)

Defined in: [utils/auditLogger.ts:411](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L411)

Global audit logger instance.

Uses default options: in-memory buffer + stderr output, no access control,
no retention policy.  Override by creating a new `AuditLogger` instance
with the desired [AuditLoggerOptions](../../auditSink/interfaces/AuditLoggerOptions.md).
