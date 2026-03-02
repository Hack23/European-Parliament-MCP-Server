[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/auditSink](../README.md) / AuditLoggerOptions

# Interface: AuditLoggerOptions

Defined in: [utils/auditSink.ts:122](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L122)

Constructor options for AuditLogger.

## Properties

### requiredAuthToken?

> `optional` **requiredAuthToken**: `string`

Defined in: [utils/auditSink.ts:135](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L135)

Authorization token required to call `getLogs()`, `queryLogs()`,
`clear()`, and `eraseByUser()`.
When absent, those methods are unrestricted (suitable for testing).

***

### retentionMs?

> `optional` **retentionMs**: `number`

Defined in: [utils/auditSink.ts:129](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L129)

Maximum age of log entries in milliseconds (data retention enforcement)

***

### sensitiveKeys?

> `optional` **sensitiveKeys**: readonly `string`[]

Defined in: [utils/auditSink.ts:140](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L140)

Top-level parameter keys treated as PII and redacted to `'[REDACTED]'`.
Defaults to [DEFAULT\_SENSITIVE\_KEYS](../variables/DEFAULT_SENSITIVE_KEYS.md).

***

### sinks?

> `optional` **sinks**: [`AuditSink`](AuditSink.md)[]

Defined in: [utils/auditSink.ts:127](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L127)

Extra write-only sinks (e.g. `FileAuditSink`, `StructuredJsonSink`).
Replaces the default `StderrAuditSink` when provided.
