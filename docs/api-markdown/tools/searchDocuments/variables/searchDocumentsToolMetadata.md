[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/searchDocuments](../README.md) / searchDocumentsToolMetadata

# Variable: searchDocumentsToolMetadata

> `const` **searchDocumentsToolMetadata**: `object`

Defined in: [tools/searchDocuments.ts:118](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/searchDocuments.ts#L118)

Tool metadata for MCP registration

## Type Declaration

### description

> **description**: `string` = `'Search European Parliament legislative documents by keyword, or retrieve a single document by docId. Filter by document type (REPORT, RESOLUTION, DECISION, DIRECTIVE, REGULATION, OPINION), date range, and committee. Returns document metadata including title, authors, status, and PDF/XML links.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.committee

> **committee**: `object`

#### inputSchema.properties.committee.description

> **description**: `string` = `'Committee identifier'`

#### inputSchema.properties.committee.maxLength

> **maxLength**: `number` = `100`

#### inputSchema.properties.committee.minLength

> **minLength**: `number` = `1`

#### inputSchema.properties.committee.type

> **type**: `string` = `'string'`

#### inputSchema.properties.dateFrom

> **dateFrom**: `object`

#### inputSchema.properties.dateFrom.description

> **description**: `string` = `'Start date filter (YYYY-MM-DD format)'`

#### inputSchema.properties.dateFrom.pattern

> **pattern**: `string` = `'^\\d{4}-\\d{2}-\\d{2}$'`

#### inputSchema.properties.dateFrom.type

> **type**: `string` = `'string'`

#### inputSchema.properties.dateTo

> **dateTo**: `object`

#### inputSchema.properties.dateTo.description

> **description**: `string` = `'End date filter (YYYY-MM-DD format)'`

#### inputSchema.properties.dateTo.pattern

> **pattern**: `string` = `'^\\d{4}-\\d{2}-\\d{2}$'`

#### inputSchema.properties.dateTo.type

> **type**: `string` = `'string'`

#### inputSchema.properties.docId

> **docId**: `object`

#### inputSchema.properties.docId.description

> **description**: `string` = `'Document ID for single document lookup (bypasses keyword search)'`

#### inputSchema.properties.docId.type

> **type**: `string` = `'string'`

#### inputSchema.properties.documentType

> **documentType**: `object`

#### inputSchema.properties.documentType.description

> **description**: `string` = `'Filter by document type'`

#### inputSchema.properties.documentType.enum

> **enum**: `string`[]

#### inputSchema.properties.documentType.type

> **type**: `string` = `'string'`

#### inputSchema.properties.keyword

> **keyword**: `object`

#### inputSchema.properties.keyword.description

> **description**: `string` = `'Search keyword or phrase (alphanumeric, spaces, hyphens, underscores only)'`

#### inputSchema.properties.keyword.maxLength

> **maxLength**: `number` = `200`

#### inputSchema.properties.keyword.minLength

> **minLength**: `number` = `1`

#### inputSchema.properties.keyword.pattern

> **pattern**: `string` = `'^[a-zA-Z0-9\\s\\-_]+$'`

#### inputSchema.properties.keyword.type

> **type**: `string` = `'string'`

#### inputSchema.properties.limit

> **limit**: `object`

#### inputSchema.properties.limit.default

> **default**: `number` = `20`

#### inputSchema.properties.limit.description

> **description**: `string` = `'Maximum number of results to return (1-100)'`

#### inputSchema.properties.limit.maximum

> **maximum**: `number` = `100`

#### inputSchema.properties.limit.minimum

> **minimum**: `number` = `1`

#### inputSchema.properties.limit.type

> **type**: `string` = `'number'`

#### inputSchema.properties.offset

> **offset**: `object`

#### inputSchema.properties.offset.default

> **default**: `number` = `0`

#### inputSchema.properties.offset.description

> **description**: `string` = `'Pagination offset'`

#### inputSchema.properties.offset.minimum

> **minimum**: `number` = `0`

#### inputSchema.properties.offset.type

> **type**: `string` = `'number'`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'search_documents'`
