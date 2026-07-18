[**European Parliament MCP Server API v1.4.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/auditSink](../README.md) / StructuredJsonSink

# Class: StructuredJsonSink

Defined in: [utils/auditSink.ts:351](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L351)

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

Defined in: [utils/auditSink.ts:354](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L354)

#### Parameters

##### writer?

(`json`) => `void`

#### Returns

`StructuredJsonSink`

## Properties

### writer

> `private` `readonly` **writer**: (`json`) => `void`

Defined in: [utils/auditSink.ts:352](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L352)

#### Parameters

##### json

`string`

#### Returns

`void`

## Methods

### write()

> **write**(`entry`): `void`

Defined in: [utils/auditSink.ts:360](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L360)

Write a single audit entry to the sink

#### Parameters

##### entry

[`AuditLogEntry`](../interfaces/AuditLogEntry.md)

#### Returns

`void`

#### Implementation of

[`AuditSink`](../interfaces/AuditSink.md).[`write`](../interfaces/AuditSink.md#write)
