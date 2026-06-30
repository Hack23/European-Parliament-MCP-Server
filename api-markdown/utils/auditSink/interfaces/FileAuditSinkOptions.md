[**European Parliament MCP Server API v1.3.31**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/auditSink](../README.md) / FileAuditSinkOptions

# Interface: FileAuditSinkOptions

Defined in: [utils/auditSink.ts:270](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L270)

Constructor options for [FileAuditSink](../classes/FileAuditSink.md).

## Properties

### filePath

> **filePath**: `string`

Defined in: [utils/auditSink.ts:272](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L272)

Absolute path to the NDJSON log file

***

### maxSizeBytes?

> `optional` **maxSizeBytes?**: `number`

Defined in: [utils/auditSink.ts:274](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L274)

Maximum file size in bytes before log rotation (default: 10 MiB)
