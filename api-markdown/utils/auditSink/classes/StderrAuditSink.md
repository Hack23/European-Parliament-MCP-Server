[**European Parliament MCP Server API v1.0.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/auditSink](../README.md) / StderrAuditSink

# Class: StderrAuditSink

Defined in: [utils/auditSink.ts:293](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L293)

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

Defined in: [utils/auditSink.ts:294](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L294)

Write a single audit entry to the sink

#### Parameters

##### entry

[`AuditLogEntry`](../interfaces/AuditLogEntry.md)

#### Returns

`void`

#### Implementation of

[`AuditSink`](../interfaces/AuditSink.md).[`write`](../interfaces/AuditSink.md#write)
