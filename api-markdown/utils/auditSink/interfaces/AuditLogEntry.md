[**European Parliament MCP Server API v1.3.22**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/auditSink](../README.md) / AuditLogEntry

# Interface: AuditLogEntry

Defined in: [utils/auditSink.ts:27](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L27)

Represents a single audited operation and its contextual metadata.

Designed for serialisation to append-only log sinks.

## Properties

### action

> **action**: `string`

Defined in: [utils/auditSink.ts:31](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L31)

Action performed (e.g. `'get_meps'`, `'tool_call'`)

***

### timestamp

> **timestamp**: [`Date`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)

Defined in: [utils/auditSink.ts:29](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L29)

Timestamp of the event

***

### clientId?

> `optional` **clientId?**: `string`

Defined in: [utils/auditSink.ts:45](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L45)

Client identifier

***

### duration?

> `optional` **duration?**: `number`

Defined in: [utils/auditSink.ts:41](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L41)

Wall-clock duration of the operation in milliseconds

***

### ipAddress?

> `optional` **ipAddress?**: `string`

Defined in: [utils/auditSink.ts:47](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L47)

IP address (for security monitoring)

***

### params?

> `optional` **params?**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Defined in: [utils/auditSink.ts:33](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L33)

Sanitised parameters used in the action

***

### result?

> `optional` **result?**: `object`

Defined in: [utils/auditSink.ts:35](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L35)

Outcome metadata

#### success

> **success**: `boolean`

#### count?

> `optional` **count?**: `number`

#### error?

> `optional` **error?**: `string`

***

### userId?

> `optional` **userId?**: `string`

Defined in: [utils/auditSink.ts:43](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L43)

User identifier (if authenticated)
