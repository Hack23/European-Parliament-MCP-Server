[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getIncomingMEPs](../README.md) / getIncomingMEPsToolMetadata

# Variable: getIncomingMEPsToolMetadata

> `const` **getIncomingMEPsToolMetadata**: `object`

Defined in: [tools/getIncomingMEPs.ts:42](https://github.com/Hack23/European-Parliament-MCP-Server/blob/67dbd67a8f5629591a17b9785bfa0977f7023afb/src/tools/getIncomingMEPs.ts#L42)

Tool metadata for get_incoming_meps

## Type Declaration

### description

> **description**: `string` = `'Get incoming Members of European Parliament for the current parliamentary term. Returns MEPs who are newly joining. Data source: European Parliament Open Data Portal.'`

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

> **name**: `string` = `'get_incoming_meps'`
