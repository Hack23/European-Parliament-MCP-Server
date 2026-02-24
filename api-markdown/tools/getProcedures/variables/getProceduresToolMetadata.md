[**European Parliament MCP Server API v0.7.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getProcedures](../README.md) / getProceduresToolMetadata

# Variable: getProceduresToolMetadata

> `const` **getProceduresToolMetadata**: `object`

Defined in: [tools/getProcedures.ts:61](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/tools/getProcedures.ts#L61)

Tool metadata for get_procedures

## Type Declaration

### description

> **description**: `string` = `'Get European Parliament legislative procedures. Supports single procedure lookup by processId or list with year filter. Data source: European Parliament Open Data Portal.'`

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

#### inputSchema.properties.processId

> **processId**: `object`

#### inputSchema.properties.processId.description

> **description**: `string` = `'Process ID for single procedure lookup'`

#### inputSchema.properties.processId.type

> **type**: `string` = `'string'`

#### inputSchema.properties.year

> **year**: `object`

#### inputSchema.properties.year.description

> **description**: `string` = `'Filter by year (e.g., 2024)'`

#### inputSchema.properties.year.type

> **type**: `string` = `'number'`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'get_procedures'`
