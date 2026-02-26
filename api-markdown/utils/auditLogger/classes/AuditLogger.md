[**European Parliament MCP Server API v0.8.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/auditLogger](../README.md) / AuditLogger

# Class: AuditLogger

Defined in: [utils/auditLogger.ts:119](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/utils/auditLogger.ts#L119)

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

> `private` **logs**: [`AuditLogEntry`](../interfaces/AuditLogEntry.md)[] = `[]`

Defined in: [utils/auditLogger.ts:120](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/utils/auditLogger.ts#L120)

## Methods

### clear()

> **clear**(): `void`

Defined in: [utils/auditLogger.ts:238](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/utils/auditLogger.ts#L238)

Clear audit logs (for testing only)

#### Returns

`void`

***

### getLogs()

> **getLogs**(): [`AuditLogEntry`](../interfaces/AuditLogEntry.md)[]

Defined in: [utils/auditLogger.ts:231](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/utils/auditLogger.ts#L231)

Get audit logs (for testing/debugging)

#### Returns

[`AuditLogEntry`](../interfaces/AuditLogEntry.md)[]

***

### log()

> **log**(`entry`): `void`

Defined in: [utils/auditLogger.ts:127](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/utils/auditLogger.ts#L127)

Log an audit event

#### Parameters

##### entry

[`Omit`](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys)\<[`AuditLogEntry`](../interfaces/AuditLogEntry.md), `"timestamp"`\>

Audit log entry

#### Returns

`void`

***

### logDataAccess()

> **logDataAccess**(`action`, `params`, `count`, `duration?`): `void`

Defined in: [utils/auditLogger.ts:186](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/utils/auditLogger.ts#L186)

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

Defined in: [utils/auditLogger.ts:211](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/utils/auditLogger.ts#L211)

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

***

### logToolCall()

> **logToolCall**(`toolName`, `params`, `success`, `duration?`, `error?`): `void`

Defined in: [utils/auditLogger.ts:156](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/utils/auditLogger.ts#L156)

Log an MCP tool call as an audit record.

Persists an [AuditLogEntry](../interfaces/AuditLogEntry.md) via [log](#log) (which emits a single
`[AUDIT]` record to stderr).  Tool-call data is nested under
`{ tool: { name, params } }` to prevent user-controlled parameter keys
from colliding with reserved log-schema fields.  Suitable for GDPR
Article 30 processing-activity records.

#### Parameters

##### toolName

`string`

Name of the MCP tool that was invoked

##### params

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Tool input parameters. **Callers are responsible for
                   sanitising sensitive values before passing them here.**
                   This method does not perform any sanitisation.

##### success

`boolean`

Whether the tool call completed without error

##### duration?

`number`

Optional wall-clock duration in milliseconds

##### error?

`string`

Optional error message if the call failed

#### Returns

`void`
