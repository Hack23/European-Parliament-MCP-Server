[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/auditSink](../README.md) / FileAuditSink

# Class: FileAuditSink

Defined in: [utils/auditSink.ts:323](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L323)

Appends audit entries as newline-delimited JSON (NDJSON) to a file.

**Log rotation:** when the file reaches `maxSizeBytes`, it is renamed to
`<filePath>.<timestamp>.bak` before the new entry is written.

## Security

The log file should be stored on a volume with restricted write
  permissions; only the server process account should have write access.

## Since

0.9.0

## Implements

- [`AuditSink`](../interfaces/AuditSink.md)

## Constructors

### Constructor

> **new FileAuditSink**(`options`): `FileAuditSink`

Defined in: [utils/auditSink.ts:332](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L332)

#### Parameters

##### options

[`FileAuditSinkOptions`](../interfaces/FileAuditSinkOptions.md)

#### Returns

`FileAuditSink`

## Properties

### filePath

> `private` `readonly` **filePath**: `string`

Defined in: [utils/auditSink.ts:324](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L324)

***

### maxSizeBytes

> `private` `readonly` **maxSizeBytes**: `number`

Defined in: [utils/auditSink.ts:325](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L325)

***

### writeQueue

> `private` **writeQueue**: [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [utils/auditSink.ts:330](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L330)

Serialises concurrent write calls so that stat + rename + appendFile
sequences never interleave across parallel `log()` invocations.

## Methods

### rotateIfNeeded()

> `private` **rotateIfNeeded**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [utils/auditSink.ts:360](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L360)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### write()

> **write**(`entry`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [utils/auditSink.ts:342](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L342)

Write a single audit entry to the sink

#### Parameters

##### entry

[`AuditLogEntry`](../interfaces/AuditLogEntry.md)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Implementation of

[`AuditSink`](../interfaces/AuditSink.md).[`write`](../interfaces/AuditSink.md#write)
