[**European Parliament MCP Server API v1.3.39**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/auditSink](../README.md) / StderrAuditSink

# Class: StderrAuditSink

Defined in: [utils/auditSink.ts:261](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L261)

Writes structured JSON audit lines to `stderr`.

MCP-compatible: `stdout` is reserved for the MCP protocol wire format.

## Since

0.9.0

## Implements

- [`AuditSink`](../interfaces/AuditSink.md)

## Constructors

### Constructor

> **new StderrAuditSink**(): `StderrAuditSink`

#### Returns

`StderrAuditSink`

## Methods

### write()

> **write**(`entry`): `void`

Defined in: [utils/auditSink.ts:262](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L262)

Write a single audit entry to the sink

#### Parameters

##### entry

[`AuditLogEntry`](../interfaces/AuditLogEntry.md)

#### Returns

`void`

#### Implementation of

[`AuditSink`](../interfaces/AuditSink.md).[`write`](../interfaces/AuditSink.md#write)
