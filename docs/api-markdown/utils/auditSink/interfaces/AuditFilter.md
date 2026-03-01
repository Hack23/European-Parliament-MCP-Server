[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/auditSink](../README.md) / AuditFilter

# Interface: AuditFilter

Defined in: [utils/auditSink.ts:61](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L61)

Filter for querying audit log entries.

## Properties

### action?

> `optional` **action**: `string`

Defined in: [utils/auditSink.ts:63](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L63)

Restrict to a specific action name

***

### since?

> `optional` **since**: [`Date`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)

Defined in: [utils/auditSink.ts:65](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L65)

Include only entries on or after this date

***

### until?

> `optional` **until**: [`Date`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)

Defined in: [utils/auditSink.ts:67](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L67)

Include only entries on or before this date

***

### userId?

> `optional` **userId**: `string`

Defined in: [utils/auditSink.ts:69](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L69)

Restrict to a specific user ID
