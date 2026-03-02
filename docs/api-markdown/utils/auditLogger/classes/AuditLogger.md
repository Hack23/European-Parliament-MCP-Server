[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/auditLogger](../README.md) / AuditLogger

# Class: AuditLogger

Defined in: [utils/auditLogger.ts:156](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L156)

GDPR-compliant audit logger with pluggable sinks, parameter sanitisation,
data retention enforcement, and access-controlled log retrieval.

## Pluggable sinks
By default the logger writes to an in-memory buffer (queryable via
`getLogs()`) and to `stderr` (MCP-compatible).  Pass a `sinks` option to
replace the default stderr sink with your own destinations
(e.g. `FileAuditSink`, `StructuredJsonSink`).

## Parameter sanitisation
All `params` objects are passed through `sanitizeParams()` before storage.
Only **top-level** keys matching `sensitiveKeys` (default:
`DEFAULT_SENSITIVE_KEYS`) are replaced by `'[REDACTED]'` to prevent PII
leakage into audit trails. Nested objects/arrays are **not** recursively
sanitised; callers must avoid placing PII in nested structures or
pre-sanitise such data before logging.

## Data retention
When `retentionMs` is set, `getLogs()` automatically filters out entries
older than the configured maximum age (GDPR Article 5(1)(e)).

## Access control
When `requiredAuthToken` is set, `getLogs()`, `queryLogs()`, `clear()`, and
`eraseByUser()` throw if the caller does not supply the correct token.

## Examples

```typescript
auditLogger.logDataAccess('get_meps', { country: 'SE' }, 5, 85);
const entries = auditLogger.getLogs();
```

```typescript
const requiredAuthToken = process.env['AUDIT_TOKEN'];
if (!requiredAuthToken) {
  throw new Error(
    'AUDIT_TOKEN environment variable must be set for audit log access control',
  );
}

const logger = new AuditLogger({
  sinks: [new FileAuditSink({ filePath: '/var/log/ep-mcp-audit.ndjson' })],
  retentionMs: 30 * 24 * 60 * 60 * 1000,
  requiredAuthToken,
});
```

## Since

0.8.0

## Constructors

### Constructor

> **new AuditLogger**(`options?`): `AuditLogger`

Defined in: [utils/auditLogger.ts:163](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L163)

#### Parameters

##### options?

[`AuditLoggerOptions`](../../auditSink/interfaces/AuditLoggerOptions.md)

#### Returns

`AuditLogger`

## Properties

### extraSinks

> `private` `readonly` **extraSinks**: readonly [`AuditSink`](../../auditSink/interfaces/AuditSink.md)[]

Defined in: [utils/auditLogger.ts:158](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L158)

***

### memorySink

> `private` `readonly` **memorySink**: [`MemoryAuditSink`](../../auditSink/classes/MemoryAuditSink.md)

Defined in: [utils/auditLogger.ts:157](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L157)

***

### requiredAuthToken

> `private` `readonly` **requiredAuthToken**: `string` \| `undefined`

Defined in: [utils/auditLogger.ts:161](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L161)

***

### retentionPolicy

> `private` `readonly` **retentionPolicy**: [`RetentionPolicy`](../../auditSink/classes/RetentionPolicy.md) \| `undefined`

Defined in: [utils/auditLogger.ts:160](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L160)

***

### sensitiveKeys

> `private` `readonly` **sensitiveKeys**: readonly `string`[]

Defined in: [utils/auditLogger.ts:159](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L159)

## Methods

### checkAuthorization()

> `private` **checkAuthorization**(`authorization?`): `void`

Defined in: [utils/auditLogger.ts:374](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L374)

#### Parameters

##### authorization?

`string`

#### Returns

`void`

***

### clear()

> **clear**(`authorization?`): `void`

Defined in: [utils/auditLogger.ts:365](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L365)

Clears all in-memory audit log entries.

**For testing only.** Clearing audit logs in production violates ISMS
Policy AU-002 and GDPR Article 30.

#### Parameters

##### authorization?

`string`

Authorization token (required when configured)

#### Returns

`void`

#### Since

0.8.0

***

### eraseByUser()

> **eraseByUser**(`userId`, `authorization?`): `void`

Defined in: [utils/auditLogger.ts:351](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L351)

Removes all audit entries associated with `userId` from in-memory storage.

**GDPR Article 17 — Right to Erasure.**  Only removes entries from the
in-memory `MemoryAuditSink`; entries already flushed to persistent sinks
(files, SIEM, etc.) must be erased separately via those sinks.

#### Parameters

##### userId

`string`

The user whose entries should be erased

##### authorization?

`string`

Authorization token (required when configured)

#### Returns

`void`

#### Since

0.9.0

***

### getLogs()

> **getLogs**(`authorization?`): [`AuditLogEntry`](../../auditSink/interfaces/AuditLogEntry.md)[]

Defined in: [utils/auditLogger.ts:317](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L317)

Returns a snapshot of all in-memory audit log entries, optionally filtered
by the configured data-retention policy.

When `requiredAuthToken` was set in the constructor, `authorization` must
match; otherwise an `Error` is thrown.

#### Parameters

##### authorization?

`string`

Authorization token (required when configured)

#### Returns

[`AuditLogEntry`](../../auditSink/interfaces/AuditLogEntry.md)[]

Entries ordered oldest-first, filtered by retention policy

#### Security

When `requiredAuthToken` is configured, this method is access-
  controlled. Do not expose the returned entries through public APIs.

#### Since

0.8.0

***

### log()

> **log**(`entry`): `void`

Defined in: [utils/auditLogger.ts:199](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L199)

Logs an audit event to the in-memory store and all configured sinks.

Parameter values matching `sensitiveKeys` are automatically replaced by
`'[REDACTED]'` before storage.

#### Parameters

##### entry

[`Omit`](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys)\<[`AuditLogEntry`](../../auditSink/interfaces/AuditLogEntry.md), `"timestamp"`\>

Audit log entry without a timestamp (generated automatically)

#### Returns

`void`

#### Security

Writes to sinks only (not stdout, which is reserved for MCP).
  Per ISMS Policy AU-002, all MCP tool calls must be audit-logged.

#### Since

0.8.0

***

### logDataAccess()

> **logDataAccess**(`action`, `params`, `count`, `duration?`): `void`

Defined in: [utils/auditLogger.ts:266](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L266)

Logs a successful data-access event (e.g. a query returning records).

#### Parameters

##### action

`string`

Action name (e.g. `'get_meps'`, `'get_committee_meetings'`)

##### params

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Query parameters (sanitised automatically)

##### count

`number`

Number of records returned

##### duration?

`number`

Optional wall-clock duration in milliseconds

#### Returns

`void`

#### Since

0.8.0

***

### logError()

> **logError**(`action`, `params`, `error`, `duration?`): `void`

Defined in: [utils/auditLogger.ts:289](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L289)

Logs a failed operation as an audit error event.

#### Parameters

##### action

`string`

Action name

##### params

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Parameters supplied to the failed operation (sanitised)

##### error

`string`

Human-readable error message (must not contain secrets)

##### duration?

`number`

Optional wall-clock duration in milliseconds

#### Returns

`void`

#### Since

0.8.0

***

### logToolCall()

> **logToolCall**(`toolName`, `params`, `success`, `duration?`, `error?`): `void`

Defined in: [utils/auditLogger.ts:233](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L233)

Log an MCP tool call as an audit record.

The tool's `params` are sanitised before being wrapped in the entry so
that PII in top-level tool parameter keys is redacted. Nested objects are
not recursively sanitised.

#### Parameters

##### toolName

`string`

Name of the MCP tool that was invoked

##### params

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Tool input parameters (sanitised automatically)

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

#### Since

0.8.0

***

### pruneExpiredEntries()

> `private` **pruneExpiredEntries**(`policy`): `void`

Defined in: [utils/auditLogger.ts:385](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L385)

#### Parameters

##### policy

[`RetentionPolicy`](../../auditSink/classes/RetentionPolicy.md)

#### Returns

`void`

***

### queryLogs()

> **queryLogs**(`filter`, `authorization?`): [`AuditLogEntry`](../../auditSink/interfaces/AuditLogEntry.md)[]

Defined in: [utils/auditLogger.ts:332](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L332)

Queries the in-memory log using a filter.

#### Parameters

##### filter

[`AuditFilter`](../../auditSink/interfaces/AuditFilter.md)

Field-based filter to apply

##### authorization?

`string`

Authorization token (required when configured)

#### Returns

[`AuditLogEntry`](../../auditSink/interfaces/AuditLogEntry.md)[]

#### Since

0.9.0

***

### writeSinks()

> `private` **writeSinks**(`entry`): `void`

Defined in: [utils/auditLogger.ts:405](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L405)

#### Parameters

##### entry

[`AuditLogEntry`](../../auditSink/interfaces/AuditLogEntry.md)

#### Returns

`void`

***

### buildRetentionPolicy()

> `private` `static` **buildRetentionPolicy**(`retentionMs`): [`RetentionPolicy`](../../auditSink/classes/RetentionPolicy.md) \| `undefined`

Defined in: [utils/auditLogger.ts:171](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L171)

#### Parameters

##### retentionMs

`number` | `undefined`

#### Returns

[`RetentionPolicy`](../../auditSink/classes/RetentionPolicy.md) \| `undefined`
