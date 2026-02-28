[**European Parliament MCP Server API v0.9.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getMEPDeclarations](../README.md) / getMEPDeclarationsToolMetadata

# Variable: getMEPDeclarationsToolMetadata

> `const` **getMEPDeclarationsToolMetadata**: `object`

Defined in: [tools/getMEPDeclarations.ts:81](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getMEPDeclarations.ts#L81)

Tool metadata for get_mep_declarations

## Type Declaration

### description

> **description**: `string` = `'Get MEP declarations of financial interests filed under the Rules of Procedure. Supports single declaration lookup by docId or list with year filter. Data source: European Parliament Open Data Portal. GDPR: Access is audit-logged.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.docId

> **docId**: `object`

#### inputSchema.properties.docId.description

> **description**: `string` = `'Document ID for single declaration lookup'`

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

> **description**: `string` = `'Filter by filing year (e.g., 2024)'`

#### inputSchema.properties.year.type

> **type**: `string` = `'number'`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'get_mep_declarations'`
