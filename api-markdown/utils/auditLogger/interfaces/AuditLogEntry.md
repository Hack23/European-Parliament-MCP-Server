[**European Parliament MCP Server API v0.9.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/auditLogger](../README.md) / AuditLogEntry

# Interface: AuditLogEntry

Defined in: [utils/auditLogger.ts:67](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L67)

Audit log entry structure, part of the public audit logging API.
Represents a single audited operation and its contextual metadata.

## Properties

### action

> **action**: `string`

Defined in: [utils/auditLogger.ts:76](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L76)

Action performed (e.g., 'get_meps', 'get_mep_details')

***

### timestamp

> **timestamp**: [`Date`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)

Defined in: [utils/auditLogger.ts:71](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L71)

Timestamp of the event

***

### clientId?

> `optional` **clientId**: `string`

Defined in: [utils/auditLogger.ts:105](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L105)

Client identifier

***

### duration?

> `optional` **duration**: `number`

Defined in: [utils/auditLogger.ts:95](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L95)

Duration of the operation in milliseconds

***

### ipAddress?

> `optional` **ipAddress**: `string`

Defined in: [utils/auditLogger.ts:110](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L110)

IP address (for security monitoring)

***

### params?

> `optional` **params**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Defined in: [utils/auditLogger.ts:81](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L81)

Parameters used in the action

***

### result?

> `optional` **result**: `object`

Defined in: [utils/auditLogger.ts:86](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L86)

Result metadata (e.g., count of records returned)

#### success

> **success**: `boolean`

#### count?

> `optional` **count**: `number`

#### error?

> `optional` **error**: `string`

***

### userId?

> `optional` **userId**: `string`

Defined in: [utils/auditLogger.ts:100](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L100)

User identifier (if authenticated)
