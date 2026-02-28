[**European Parliament MCP Server API v0.9.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/auditLogger](../README.md) / AuditLogger

# Class: AuditLogger

Defined in: [utils/auditLogger.ts:119](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L119)

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

Defined in: [utils/auditLogger.ts:120](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L120)

## Methods

### clear()

> **clear**(): `void`

Defined in: [utils/auditLogger.ts:362](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L362)

Clears all in-memory audit log entries.

**For testing only.** Calling this in production will silently discard
audit records that have not yet been flushed to a persistent sink,
violating ISMS Policy AU-002.

#### Returns

`void`

#### Example

```typescript
afterEach(() => {
  auditLogger.clear();
});
```

#### Security

Must NOT be called in production code. Clearing audit logs
  without an authorised retention policy violates GDPR Article 30 and
  ISMS Policy AU-002 (Audit Logging and Monitoring).

#### Since

0.8.0

***

### getLogs()

> **getLogs**(): [`AuditLogEntry`](../interfaces/AuditLogEntry.md)[]

Defined in: [utils/auditLogger.ts:339](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L339)

Returns a snapshot copy of all in-memory audit log entries.

Intended primarily for **testing and debugging**. In production, audit
records are emitted to `stderr` in real time; this method allows test
suites to assert on logged events without parsing stderr output.

#### Returns

[`AuditLogEntry`](../interfaces/AuditLogEntry.md)[]

Shallow copy of the internal log buffer as an array of
  [AuditLogEntry](../interfaces/AuditLogEntry.md) objects, ordered oldest-first. Mutating the
  returned array does not affect the internal buffer.

#### Example

```typescript
auditLogger.logDataAccess('get_meps', {}, 5);
const logs = auditLogger.getLogs();
expect(logs).toHaveLength(1);
expect(logs[0]?.action).toBe('get_meps');
```

#### Security

The returned entries may contain sanitised parameters that were
  passed by callers. Treat the output as sensitive and do not expose it
  through public API endpoints.

#### Since

0.8.0

***

### log()

> **log**(`entry`): `void`

Defined in: [utils/auditLogger.ts:146](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L146)

Logs an audit event to the in-memory store and stderr.

Appends a timestamped [AuditLogEntry](../interfaces/AuditLogEntry.md) to the internal log buffer and
emits a single structured JSON line to `stderr` (stdout is reserved for the
MCP protocol wire format).

#### Parameters

##### entry

[`Omit`](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys)\<[`AuditLogEntry`](../interfaces/AuditLogEntry.md), `"timestamp"`\>

Audit log entry without a timestamp (generated automatically)

#### Returns

`void`

#### Throws

If `entry.action` is not a string

#### Example

```typescript
auditLogger.log({
  action: 'get_meps',
  params: { country: 'DE' },
  result: { success: true, count: 42 },
  duration: 120
});
```

#### Security

Writes to stderr only (not stdout, which is reserved for MCP protocol).
  Per ISMS Policy AU-002, all MCP tool calls must be audit-logged.

#### Since

0.8.0

***

### logDataAccess()

> **logDataAccess**(`action`, `params`, `count`, `duration?`): `void`

Defined in: [utils/auditLogger.ts:252](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L252)

Logs a successful data-access event (e.g., a query returning records).

Convenience wrapper around [log](#log) that constructs a success result
with a record count. Suitable for GDPR Article 30 processing-activity
records where the data subject count is relevant.

#### Parameters

##### action

`string`

Action name (e.g., `'get_meps'`, `'get_committee_meetings'`)

##### params

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Sanitised query parameters used for the data access

##### count

`number`

Number of records returned / accessed

##### duration?

`number`

Optional wall-clock duration in milliseconds

#### Returns

`void`

#### Throws

If `action` is not a string or `count` is not a number

#### Example

```typescript
auditLogger.logDataAccess(
  'get_meps',
  { country: 'SE', group: 'EPP' },
  7,
  85
);
```

#### Security

Params must be sanitised by the caller before passing to this
  method—no PII stripping is performed internally.
  Per ISMS Policy AU-002 / GDPR Article 30, data-access events must be
  logged with subject counts for processing-activity records.

#### Since

0.8.0

***

### logError()

> **logError**(`action`, `params`, `error`, `duration?`): `void`

Defined in: [utils/auditLogger.ts:298](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L298)

Logs a failed operation as an audit error event.

Convenience wrapper around [log](#log) that constructs a failure result.
Use this whenever an MCP tool or EP API call throws or returns an error
so the failure is captured in the audit trail.

#### Parameters

##### action

`string`

Action name (e.g., `'get_mep_details'`, `'get_plenary_sessions'`)

##### params

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Sanitised parameters that were supplied to the failed operation

##### error

`string`

Human-readable error message (must not contain secrets or PII)

##### duration?

`number`

Optional wall-clock duration in milliseconds before failure

#### Returns

`void`

#### Throws

If `action` or `error` is not a string

#### Example

```typescript
auditLogger.logError(
  'get_mep_details',
  { mepId: 99999 },
  'MEP not found',
  30
);
```

#### Security

Error messages must not include secrets, tokens, or raw stack
  traces. Sanitise before passing to avoid leaking internal details to
  log sinks accessible by ops teams.
  Per ISMS Policy AU-002, failed operations must be audit-logged.

#### Since

0.8.0

***

### logToolCall()

> **logToolCall**(`toolName`, `params`, `success`, `duration?`, `error?`): `void`

Defined in: [utils/auditLogger.ts:201](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L201)

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

#### Throws

If `toolName` is not a string

#### Example

```typescript
auditLogger.logToolCall(
  'get_mep_details',
  { mepId: 12345 },
  true,
  95,
);

// On failure:
auditLogger.logToolCall(
  'get_plenary_sessions',
  { term: 10 },
  false,
  200,
  'EP API returned 503'
);
```

#### Security

Parameter values are nested under a `tool` key to prevent
  user-controlled keys from colliding with reserved audit-schema fields.
  Callers must sanitise PII before passing `params`.
  Per ISMS Policy AU-002, all MCP tool calls must be audit-logged.

#### Since

0.8.0
