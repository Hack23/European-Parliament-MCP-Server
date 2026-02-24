[**European Parliament MCP Server API v0.6.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getPlenarySessionDocumentItems](../README.md) / getPlenarySessionDocumentItemsToolMetadata

# Variable: getPlenarySessionDocumentItemsToolMetadata

> `const` **getPlenarySessionDocumentItemsToolMetadata**: `object`

Defined in: [tools/getPlenarySessionDocumentItems.ts:45](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/tools/getPlenarySessionDocumentItems.ts#L45)

Tool metadata for get_plenary_session_document_items

## Type Declaration

### description

> **description**: `string` = `'Get European Parliament plenary session document items. Returns individual items within plenary session documents. Data source: European Parliament Open Data Portal.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.limit

> **limit**: `object`

#### inputSchema.properties.limit.default

> **default**: `number` = `50`

#### inputSchema.properties.limit.description

> **description**: `string` = `'Maximum results to return (1-100)'`

#### inputSchema.properties.limit.type

> **type**: `string` = `'number'`

#### inputSchema.properties.offset

> **offset**: `object`

#### inputSchema.properties.offset.default

> **default**: `number` = `0`

#### inputSchema.properties.offset.description

> **description**: `string` = `'Pagination offset'`

#### inputSchema.properties.offset.type

> **type**: `string` = `'number'`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'get_plenary_session_document_items'`
