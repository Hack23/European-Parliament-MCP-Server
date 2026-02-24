[**European Parliament MCP Server API v0.6.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getExternalDocuments](../README.md) / getExternalDocumentsToolMetadata

# Variable: getExternalDocumentsToolMetadata

> `const` **getExternalDocumentsToolMetadata**: `object`

Defined in: [tools/getExternalDocuments.ts:61](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/tools/getExternalDocuments.ts#L61)

Tool metadata for get_external_documents

## Type Declaration

### description

> **description**: `string` = `'Get external documents (non-EP documents such as Council positions, Commission proposals) from the European Parliament data portal. Supports single document lookup by docId. Data source: European Parliament Open Data Portal.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.docId

> **docId**: `object`

#### inputSchema.properties.docId.description

> **description**: `string` = `'Document ID for single document lookup'`

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

> **description**: `string` = `'Filter by year'`

#### inputSchema.properties.year.type

> **type**: `string` = `'number'`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'get_external_documents'`
