[**European Parliament MCP Server API v1.0.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/auditSink](../README.md) / StructuredJsonSink

# Class: StructuredJsonSink

Defined in: [utils/auditSink.ts:400](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L400)

Serialises each audit entry to JSON and passes it to a writer callback.

Suitable for forwarding to structured log aggregators such as
AWS CloudWatch, Elasticsearch, or Splunk.

## Example

```typescript
const sink = new StructuredJsonSink((json) => cloudwatch.putLogEvent(json));
const logger = new AuditLogger({ sinks: [sink] });
```

## Since

0.9.0

## Implements

- [`AuditSink`](../interfaces/AuditSink.md)

## Constructors

### Constructor

> **new StructuredJsonSink**(`writer?`): `StructuredJsonSink`

Defined in: [utils/auditSink.ts:403](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L403)

#### Parameters

##### writer?

(`json`) => `void`

#### Returns

`StructuredJsonSink`

## Properties

### writer()

> `private` `readonly` **writer**: (`json`) => `void`

Defined in: [utils/auditSink.ts:401](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L401)

#### Parameters

##### json

`string`

#### Returns

`void`

## Methods

### write()

> **write**(`entry`): `void`

Defined in: [utils/auditSink.ts:409](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L409)

Write a single audit entry to the sink

#### Parameters

##### entry

[`AuditLogEntry`](../interfaces/AuditLogEntry.md)

#### Returns

`void`

#### Implementation of

[`AuditSink`](../interfaces/AuditSink.md).[`write`](../interfaces/AuditSink.md#write)
