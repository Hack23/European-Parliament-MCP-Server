[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/comparativeIntelligence](../README.md) / comparativeIntelligenceToolMetadata

# Variable: comparativeIntelligenceToolMetadata

> `const` **comparativeIntelligenceToolMetadata**: `object`

Defined in: [tools/comparativeIntelligence.ts:426](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/comparativeIntelligence.ts#L426)

## Type Declaration

### description

> **description**: `string` = `'Cross-reference 2-10 MEP activities across voting, committee, legislative, and attendance dimensions. Returns ranked profiles, correlation matrix, outlier detection, and cluster analysis for comprehensive comparative intelligence.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.dimensions

> **dimensions**: `object`

#### inputSchema.properties.dimensions.default

> **default**: `string`[]

#### inputSchema.properties.dimensions.description

> **description**: `string` = `'Dimensions to include in the comparison'`

#### inputSchema.properties.dimensions.items

> **items**: `object`

#### inputSchema.properties.dimensions.items.enum

> **enum**: `string`[]

#### inputSchema.properties.dimensions.items.type

> **type**: `string` = `'string'`

#### inputSchema.properties.dimensions.type

> **type**: `string` = `'array'`

#### inputSchema.properties.mepIds

> **mepIds**: `object`

#### inputSchema.properties.mepIds.description

> **description**: `string` = `'List of MEP IDs to compare (2-10 MEPs)'`

#### inputSchema.properties.mepIds.items

> **items**: `object`

#### inputSchema.properties.mepIds.items.type

> **type**: `string` = `'number'`

#### inputSchema.properties.mepIds.maxItems

> **maxItems**: `number` = `10`

#### inputSchema.properties.mepIds.minItems

> **minItems**: `number` = `2`

#### inputSchema.properties.mepIds.type

> **type**: `string` = `'array'`

#### inputSchema.required

> **required**: `string`[]

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'comparative_intelligence'`
