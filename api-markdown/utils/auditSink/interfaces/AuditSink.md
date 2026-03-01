[**European Parliament MCP Server API v1.0.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/auditSink](../README.md) / AuditSink

# Interface: AuditSink

Defined in: [utils/auditSink.ts:98](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L98)

Pluggable audit sink interface.

Implement this to create custom log destinations (files, SIEM, syslog …).

## Example

```typescript
class MyCustomSink implements AuditSink {
  write(entry: AuditLogEntry): void {
    myExternalSystem.send(entry);
  }
}
```

## Methods

### write()

> **write**(`entry`): `void` \| [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [utils/auditSink.ts:100](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L100)

Write a single audit entry to the sink

#### Parameters

##### entry

[`AuditLogEntry`](AuditLogEntry.md)

#### Returns

`void` \| [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### clear()?

> `optional` **clear**(`authorization?`): `void`

Defined in: [utils/auditSink.ts:112](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L112)

Clear all entries.
Implemented by in-memory sinks; write-only sinks omit this.
The `authorization` parameter may be provided by callers; validation is
the responsibility of the calling context (typically AuditLogger).

#### Parameters

##### authorization?

`string`

#### Returns

`void`

***

### query()?

> `optional` **query**(`filter`): [`AuditLogEntry`](AuditLogEntry.md)[]

Defined in: [utils/auditSink.ts:105](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L105)

Query entries matching a filter.
Implemented by in-memory sinks; write-only sinks omit this.

#### Parameters

##### filter

[`AuditFilter`](AuditFilter.md)

#### Returns

[`AuditLogEntry`](AuditLogEntry.md)[]
