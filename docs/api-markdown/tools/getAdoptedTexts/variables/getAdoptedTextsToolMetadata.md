[**European Parliament MCP Server API v0.7.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getAdoptedTexts](../README.md) / getAdoptedTextsToolMetadata

# Variable: getAdoptedTextsToolMetadata

> `const` **getAdoptedTextsToolMetadata**: `object`

Defined in: [tools/getAdoptedTexts.ts:62](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/tools/getAdoptedTexts.ts#L62)

Tool metadata for get_adopted_texts

## Type Declaration

### description

> **description**: `string` = `'Get European Parliament adopted texts including legislative resolutions, positions, and non-legislative resolutions. Supports single document lookup by docId or list with year filter. Data source: European Parliament Open Data Portal.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.docId

> **docId**: `object`

#### inputSchema.properties.docId.description

> **description**: `string` = `'Document ID for single adopted text lookup'`

#### inputSchema.properties.docId.type

> **type**: `string` = `'string'`

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

#### inputSchema.properties.year

> **year**: `object`

#### inputSchema.properties.year.description

> **description**: `string` = `'Filter by year of adoption (e.g., 2024)'`

#### inputSchema.properties.year.type

> **type**: `string` = `'number'`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'get_adopted_texts'`
