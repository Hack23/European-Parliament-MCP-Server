[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/auditLogger](../README.md) / AuditEvent

# Interface: AuditEvent

Defined in: [utils/auditLogger.ts:81](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L81)

Structured audit event used for MCP tool call tracking.

Designed to be serialised to JSON for append-only log sinks
(CloudWatch, Elasticsearch, etc.).

## Properties

### action

> **action**: `string`

Defined in: [utils/auditLogger.ts:87](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L87)

Action / tool name

***

### level

> **level**: [`LogLevel`](../enumerations/LogLevel.md)

Defined in: [utils/auditLogger.ts:83](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L83)

Severity level of the event

***

### timestamp

> **timestamp**: `string`

Defined in: [utils/auditLogger.ts:85](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L85)

ISO-8601 timestamp

***

### duration?

> `optional` **duration**: `number`

Defined in: [utils/auditLogger.ts:99](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L99)

Wall-clock duration of the operation in milliseconds

***

### params?

> `optional` **params**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Defined in: [utils/auditLogger.ts:91](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L91)

Sanitised tool input parameters

***

### result?

> `optional` **result**: `object`

Defined in: [utils/auditLogger.ts:93](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L93)

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

Defined in: [utils/auditLogger.ts:89](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L89)

MCP tool name (if the event was triggered by a tool call)
