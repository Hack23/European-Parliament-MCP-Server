[**European Parliament MCP Server API v1.2.7**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getPlenaryDocumentsFeed](../README.md) / getPlenaryDocumentsFeedToolMetadata

# Variable: getPlenaryDocumentsFeedToolMetadata

> `const` **getPlenaryDocumentsFeedToolMetadata**: `object`

Defined in: [tools/getPlenaryDocumentsFeed.ts:68](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getPlenaryDocumentsFeed.ts#L68)

Tool metadata for get_plenary_documents_feed

## Type Declaration

### description

> **description**: `string` = `'Get recently updated plenary documents from the EP Open Data Portal feed. This is a fixed-window feed — no parameters needed. Returns items updated within the server-defined default window (typically one month). Data source: European Parliament Open Data Portal.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object` = `{}`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'get_plenary_documents_feed'`
