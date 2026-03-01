[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/auditSink](../README.md) / MemoryAuditSink

# Class: MemoryAuditSink

Defined in: [utils/auditSink.ts:234](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L234)

In-memory audit sink.

Buffers entries in a private array and supports querying and per-user
erasure (GDPR Article 17 — Right to Erasure).

## Since

0.9.0

## Implements

- [`AuditSink`](../interfaces/AuditSink.md)

## Constructors

### Constructor

> **new MemoryAuditSink**(): `MemoryAuditSink`

#### Returns

`MemoryAuditSink`

## Properties

### entries

> `private` **entries**: [`AuditLogEntry`](../interfaces/AuditLogEntry.md)[] = `[]`

Defined in: [utils/auditSink.ts:235](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L235)

## Methods

### clear()

> **clear**(`_authorization?`): `void`

Defined in: [utils/auditSink.ts:252](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L252)

Clears the internal buffer.
The `authorization` param is accepted but unused — access control is
enforced by `AuditLogger`.

#### Parameters

##### \_authorization?

`string`

#### Returns

`void`

#### Implementation of

[`AuditSink`](../interfaces/AuditSink.md).[`clear`](../interfaces/AuditSink.md#clear)

***

### eraseByUser()

> **eraseByUser**(`userId`): `void`

Defined in: [utils/auditSink.ts:261](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L261)

Removes all entries associated with `userId`.

GDPR Article 17 — Right to Erasure.

#### Parameters

##### userId

`string`

#### Returns

`void`

***

### matchesFilter()

> `private` **matchesFilter**(`entry`, `filter`): `boolean`

Defined in: [utils/auditSink.ts:265](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L265)

#### Parameters

##### entry

[`AuditLogEntry`](../interfaces/AuditLogEntry.md)

##### filter

[`AuditFilter`](../interfaces/AuditFilter.md)

#### Returns

`boolean`

***

### query()

> **query**(`filter`): [`AuditLogEntry`](../interfaces/AuditLogEntry.md)[]

Defined in: [utils/auditSink.ts:243](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L243)

Returns entries matching the supplied filter.

#### Parameters

##### filter

[`AuditFilter`](../interfaces/AuditFilter.md)

#### Returns

[`AuditLogEntry`](../interfaces/AuditLogEntry.md)[]

#### Implementation of

[`AuditSink`](../interfaces/AuditSink.md).[`query`](../interfaces/AuditSink.md#query)

***

### write()

> **write**(`entry`): `void`

Defined in: [utils/auditSink.ts:238](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L238)

Appends the entry to the internal buffer.

#### Parameters

##### entry

[`AuditLogEntry`](../interfaces/AuditLogEntry.md)

#### Returns

`void`

#### Implementation of

[`AuditSink`](../interfaces/AuditSink.md).[`write`](../interfaces/AuditSink.md#write)
