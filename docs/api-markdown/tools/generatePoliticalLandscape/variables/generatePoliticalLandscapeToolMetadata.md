[**European Parliament MCP Server API v0.8.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/generatePoliticalLandscape](../README.md) / generatePoliticalLandscapeToolMetadata

# Variable: generatePoliticalLandscapeToolMetadata

> `const` **generatePoliticalLandscapeToolMetadata**: `object`

Defined in: [tools/generatePoliticalLandscape.ts:295](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/tools/generatePoliticalLandscape.ts#L295)

Tool metadata for MCP listing

## Type Declaration

### description

> **description**: `string` = `'Generate a comprehensive political landscape overview of the European Parliament — group sizes, seat shares, coalition dynamics, bloc analysis, and power balance. Single-call situational awareness for strategic intelligence.'`

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

#### inputSchema.required

> **required**: `never`[] = `[]`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'generate_political_landscape'`
