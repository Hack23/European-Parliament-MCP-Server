[**European Parliament MCP Server API v0.7.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/analyzeCountryDelegation](../README.md) / analyzeCountryDelegationToolMetadata

# Variable: analyzeCountryDelegationToolMetadata

> `const` **analyzeCountryDelegationToolMetadata**: `object`

Defined in: [tools/analyzeCountryDelegation.ts:303](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/analyzeCountryDelegation.ts#L303)

Tool metadata for MCP listing

## Type Declaration

### description

> **description**: `string` = `'Analyze a country\'s MEP delegation in the European Parliament — political group distribution, voting behavior, committee presence, and national cohesion. Reveals national interest patterns that cut across party lines.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.country

> **country**: `object`

#### inputSchema.properties.country.description

> **description**: `string` = `'ISO 3166-1 alpha-2 country code (e.g., "SE", "DE", "FR")'`

#### inputSchema.properties.country.type

> **type**: `string` = `'string'`

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

> **required**: `string`[]

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'analyze_country_delegation'`
