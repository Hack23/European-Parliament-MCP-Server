[**European Parliament MCP Server API v1.2.10**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getCommitteeDocuments](../README.md) / getCommitteeDocumentsToolMetadata

# Variable: getCommitteeDocumentsToolMetadata

> `const` **getCommitteeDocumentsToolMetadata**: `object`

Defined in: [tools/getCommitteeDocuments.ts:104](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getCommitteeDocuments.ts#L104)

Tool metadata for get_committee_documents

## Type Declaration

### description

> **description**: `string` = `'Get European Parliament committee documents. Supports single document lookup by docId or paginated list. Note: The EP API /committee-documents endpoint does not support year filtering. Data source: European Parliament Open Data Portal.'`

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

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'get_committee_documents'`
