[**European Parliament MCP Server API v0.7.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getCurrentMEPs](../README.md) / getCurrentMEPsToolMetadata

# Variable: getCurrentMEPsToolMetadata

> `const` **getCurrentMEPsToolMetadata**: `object`

Defined in: [tools/getCurrentMEPs.ts:43](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/getCurrentMEPs.ts#L43)

Tool metadata for get_current_meps

## Type Declaration

### description

> **description**: `string` = `'Get currently active Members of European Parliament (today\'s date). Returns only MEPs with active mandates. Data source: European Parliament Open Data Portal.'`

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

> **name**: `string` = `'get_current_meps'`
