[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/auditSink](../README.md) / FileAuditSinkOptions

# Interface: FileAuditSinkOptions

Defined in: [utils/auditSink.ts:306](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L306)

Constructor options for [FileAuditSink](../classes/FileAuditSink.md).

## Properties

### filePath

> **filePath**: `string`

Defined in: [utils/auditSink.ts:308](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L308)

Absolute path to the NDJSON log file

***

### maxSizeBytes?

> `optional` **maxSizeBytes**: `number`

Defined in: [utils/auditSink.ts:310](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L310)

Maximum file size in bytes before log rotation (default: 10 MiB)
