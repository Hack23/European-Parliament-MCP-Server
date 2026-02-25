[**European Parliament MCP Server API v0.8.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getCommitteeDocuments](../README.md) / getCommitteeDocumentsToolMetadata

# Variable: getCommitteeDocumentsToolMetadata

> `const` **getCommitteeDocumentsToolMetadata**: `object`

Defined in: [tools/getCommitteeDocuments.ts:52](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/tools/getCommitteeDocuments.ts#L52)

Tool metadata for get_committee_documents

## Type Declaration

### description

> **description**: `string` = `'Get European Parliament committee documents. Supports single document lookup by docId or list with year filter. Data source: European Parliament Open Data Portal.'`

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

> **name**: `string` = `'get_committee_documents'`
