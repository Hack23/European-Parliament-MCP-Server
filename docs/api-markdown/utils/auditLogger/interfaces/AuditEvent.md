[**European Parliament MCP Server API v0.9.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/auditLogger](../README.md) / AuditEvent

# Interface: AuditEvent

Defined in: [utils/auditLogger.ts:42](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L42)

Structured audit event used for MCP tool call tracking.

Designed to be serialised to JSON for append-only log sinks
(CloudWatch, Elasticsearch, etc.).

## Properties

### action

> **action**: `string`

Defined in: [utils/auditLogger.ts:48](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L48)

Action / tool name

***

### level

> **level**: [`LogLevel`](../enumerations/LogLevel.md)

Defined in: [utils/auditLogger.ts:44](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L44)

Severity level of the event

***

### timestamp

> **timestamp**: `string`

Defined in: [utils/auditLogger.ts:46](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L46)

ISO-8601 timestamp

***

### duration?

> `optional` **duration**: `number`

Defined in: [utils/auditLogger.ts:60](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L60)

Wall-clock duration of the operation in milliseconds

***

### params?

> `optional` **params**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Defined in: [utils/auditLogger.ts:52](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L52)

Sanitised tool input parameters

***

### result?

> `optional` **result**: `object`

Defined in: [utils/auditLogger.ts:54](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L54)

Outcome metadata

#### success

> **success**: `boolean`

#### count?

> `optional` **count**: `number`

#### error?

> `optional` **error**: `string`

***

### toolName?

> `optional` **toolName**: `string`

Defined in: [utils/auditLogger.ts:50](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L50)

MCP tool name (if the event was triggered by a tool call)
