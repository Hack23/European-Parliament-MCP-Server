[**European Parliament MCP Server API v0.7.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/auditLogger](../README.md) / AuditLogger

# Class: AuditLogger

Defined in: [utils/auditLogger.ts:75](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/utils/auditLogger.ts#L75)

Audit logger implementation

In production, this should write to a secure, append-only log storage
such as CloudWatch Logs, Elasticsearch, or a dedicated audit log service.

## Constructors

### Constructor

> **new AuditLogger**(): `AuditLogger`

#### Returns

`AuditLogger`

## Properties

### logs

> `private` **logs**: `AuditLogEntry`[] = `[]`

Defined in: [utils/auditLogger.ts:76](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/utils/auditLogger.ts#L76)

## Methods

### clear()

> **clear**(): `void`

Defined in: [utils/auditLogger.ts:155](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/utils/auditLogger.ts#L155)

Clear audit logs (for testing only)

#### Returns

`void`

***

### getLogs()

> **getLogs**(): `AuditLogEntry`[]

Defined in: [utils/auditLogger.ts:148](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/utils/auditLogger.ts#L148)

Get audit logs (for testing/debugging)

#### Returns

`AuditLogEntry`[]

***

### log()

> **log**(`entry`): `void`

Defined in: [utils/auditLogger.ts:83](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/utils/auditLogger.ts#L83)

Log an audit event

#### Parameters

##### entry

[`Omit`](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys)\<`AuditLogEntry`, `"timestamp"`\>

Audit log entry

#### Returns

`void`

***

### logDataAccess()

> **logDataAccess**(`action`, `params`, `count`, `duration?`): `void`

Defined in: [utils/auditLogger.ts:103](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/utils/auditLogger.ts#L103)

Log a successful data access

#### Parameters

##### action

`string`

Action name

##### params

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Action parameters

##### count

`number`

Number of records accessed

##### duration?

`number`

Optional operation duration in milliseconds

#### Returns

`void`

***

### logError()

> **logError**(`action`, `params`, `error`, `duration?`): `void`

Defined in: [utils/auditLogger.ts:128](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/utils/auditLogger.ts#L128)

Log a failed operation

#### Parameters

##### action

`string`

Action name

##### params

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Action parameters

##### error

`string`

Error message

##### duration?

`number`

Optional operation duration in milliseconds

#### Returns

`void`
