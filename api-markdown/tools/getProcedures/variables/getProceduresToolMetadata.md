[**European Parliament MCP Server API v1.2.13**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getProcedures](../README.md) / getProceduresToolMetadata

# Variable: getProceduresToolMetadata

> `const` **getProceduresToolMetadata**: `object`

Defined in: [tools/getProcedures.ts:129](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getProcedures.ts#L129)

Tool metadata for get_procedures

## Type Declaration

### description

> **description**: `string` = `'Get European Parliament legislative procedures. Supports single procedure lookup by processId or paginated list. Note: The EP API /procedures endpoint does not support year filtering. Data source: European Parliament Open Data Portal.'`

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

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'get_procedures'`
