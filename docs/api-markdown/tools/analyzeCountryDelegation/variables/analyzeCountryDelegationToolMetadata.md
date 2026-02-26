[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/analyzeCountryDelegation](../README.md) / analyzeCountryDelegationToolMetadata

# Variable: analyzeCountryDelegationToolMetadata

> `const` **analyzeCountryDelegationToolMetadata**: `object`

Defined in: [tools/analyzeCountryDelegation.ts:303](https://github.com/Hack23/European-Parliament-MCP-Server/blob/67dbd67a8f5629591a17b9785bfa0977f7023afb/src/tools/analyzeCountryDelegation.ts#L303)

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
