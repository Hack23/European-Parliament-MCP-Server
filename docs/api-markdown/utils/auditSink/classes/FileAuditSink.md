[**European Parliament MCP Server API v1.3.27**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/auditSink](../README.md) / FileAuditSink

# Class: FileAuditSink

Defined in: [utils/auditSink.ts:287](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L287)

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

Defined in: [utils/auditSink.ts:296](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L296)

#### Parameters

##### options

[`FileAuditSinkOptions`](../interfaces/FileAuditSinkOptions.md)

#### Returns

`FileAuditSink`

## Properties

### filePath

> `private` `readonly` **filePath**: `string`

Defined in: [utils/auditSink.ts:288](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L288)

***

### maxSizeBytes

> `private` `readonly` **maxSizeBytes**: `number`

Defined in: [utils/auditSink.ts:289](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L289)

***

### writeQueue

> `private` **writeQueue**: [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [utils/auditSink.ts:294](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L294)

Serialises concurrent write calls so that stat + rename + appendFile
sequences never interleave across parallel `log()` invocations.

## Methods

### rotateIfNeeded()

> `private` **rotateIfNeeded**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [utils/auditSink.ts:318](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L318)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### write()

> **write**(`entry`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [utils/auditSink.ts:306](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L306)

Write a single audit entry to the sink

#### Parameters

##### entry

[`AuditLogEntry`](../interfaces/AuditLogEntry.md)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Implementation of

[`AuditSink`](../interfaces/AuditSink.md).[`write`](../interfaces/AuditSink.md#write)
