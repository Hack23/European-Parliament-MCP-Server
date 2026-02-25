[**European Parliament MCP Server API v0.7.3**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getSpeeches](../README.md) / getSpeechesToolMetadata

# Variable: getSpeechesToolMetadata

> `const` **getSpeechesToolMetadata**: `object`

Defined in: [tools/getSpeeches.ts:62](https://github.com/Hack23/European-Parliament-MCP-Server/blob/c844f163befb571516b5718c5d197eff1e589dea/src/tools/getSpeeches.ts#L62)

Tool metadata for get_speeches

## Type Declaration

### description

> **description**: `string` = `'Get European Parliament plenary speeches and debate contributions. Supports single speech lookup by speechId or list with date range filtering. Data source: European Parliament Open Data Portal.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.dateFrom

> **dateFrom**: `object`

#### inputSchema.properties.dateFrom.description

> **description**: `string` = `'Start date (YYYY-MM-DD)'`

#### inputSchema.properties.dateFrom.type

> **type**: `string` = `'string'`

#### inputSchema.properties.dateTo

> **dateTo**: `object`

#### inputSchema.properties.dateTo.description

> **description**: `string` = `'End date (YYYY-MM-DD)'`

#### inputSchema.properties.dateTo.type

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

#### inputSchema.properties.speechId

> **speechId**: `object`

#### inputSchema.properties.speechId.description

> **description**: `string` = `'Speech ID for single speech lookup'`

#### inputSchema.properties.speechId.type

> **type**: `string` = `'string'`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'get_speeches'`
