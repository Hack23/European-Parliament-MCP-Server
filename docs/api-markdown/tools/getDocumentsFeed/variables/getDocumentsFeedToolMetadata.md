[**European Parliament MCP Server API v1.2.9**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getDocumentsFeed](../README.md) / getDocumentsFeedToolMetadata

# Variable: getDocumentsFeedToolMetadata

> `const` **getDocumentsFeedToolMetadata**: `object`

Defined in: [tools/getDocumentsFeed.ts:67](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getDocumentsFeed.ts#L67)

Tool metadata for get_documents_feed

## Type Declaration

### description

> **description**: `string` = `'Get recently updated documents from the EP Open Data Portal feed. This is a fixed-window feed — no parameters needed. Returns items updated within the server-defined default window (typically one month). Data source: European Parliament Open Data Portal.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object` = `{}`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'get_documents_feed'`
