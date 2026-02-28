[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/auditSink](../README.md) / RetentionPolicy

# Class: RetentionPolicy

Defined in: [utils/auditSink.ts:203](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L203)

Enforces a configurable data-retention window by filtering out expired entries.

GDPR Article 5(1)(e) — Storage limitation principle.

## Example

```typescript
const policy = new RetentionPolicy(30 * 24 * 60 * 60 * 1000); // 30 days
const fresh = policy.enforce(auditLogger.getLogs());
```

## Since

0.9.0

## Constructors

### Constructor

> **new RetentionPolicy**(`maxAgeMs`): `RetentionPolicy`

Defined in: [utils/auditSink.ts:204](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L204)

#### Parameters

##### maxAgeMs

`number`

#### Returns

`RetentionPolicy`

## Properties

### maxAgeMs

> `private` `readonly` **maxAgeMs**: `number`

Defined in: [utils/auditSink.ts:204](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L204)

## Methods

### enforce()

> **enforce**(`entries`): [`AuditLogEntry`](../interfaces/AuditLogEntry.md)[]

Defined in: [utils/auditSink.ts:209](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L209)

Returns only entries whose timestamp is within the retention window.

#### Parameters

##### entries

[`AuditLogEntry`](../interfaces/AuditLogEntry.md)[]

#### Returns

[`AuditLogEntry`](../interfaces/AuditLogEntry.md)[]

***

### isExpired()

> **isExpired**(`entry`): `boolean`

Defined in: [utils/auditSink.ts:217](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L217)

Returns `true` if the given entry has exceeded the retention period.

#### Parameters

##### entry

[`AuditLogEntry`](../interfaces/AuditLogEntry.md)

#### Returns

`boolean`
