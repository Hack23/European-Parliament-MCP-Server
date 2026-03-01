[**European Parliament MCP Server API v1.0.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/assessMepInfluence](../README.md) / assessMepInfluenceToolMetadata

# Variable: assessMepInfluenceToolMetadata

> `const` **assessMepInfluenceToolMetadata**: `object`

Defined in: [tools/assessMepInfluence.ts:395](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/assessMepInfluence.ts#L395)

Tool metadata for MCP registration

## Type Declaration

### description

> **description**: `string` = `'Compute MEP influence score using a 5-dimension weighted model: Voting Activity (25%), Legislative Output (25%), Committee Engagement (20%), Parliamentary Oversight (15%), Coalition Building (15%). Returns overall score, rank, dimension breakdowns, and computed attributes including participation rate, loyalty score, diversity index, and leadership indicator.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.dateFrom

> **dateFrom**: `object`

#### inputSchema.properties.dateFrom.description

> **description**: `string` = `'Analysis start date (YYYY-MM-DD format)'`

#### inputSchema.properties.dateFrom.pattern

> **pattern**: `string` = `'^\\d{4}-\\d{2}-\\d{2}$'`

#### inputSchema.properties.dateFrom.type

> **type**: `string` = `'string'`

#### inputSchema.properties.dateTo

> **dateTo**: `object`

#### inputSchema.properties.dateTo.description

> **description**: `string` = `'Analysis end date (YYYY-MM-DD format)'`

#### inputSchema.properties.dateTo.pattern

> **pattern**: `string` = `'^\\d{4}-\\d{2}-\\d{2}$'`

#### inputSchema.properties.dateTo.type

> **type**: `string` = `'string'`

#### inputSchema.properties.includeDetails

> **includeDetails**: `object`

#### inputSchema.properties.includeDetails.default

> **default**: `boolean` = `false`

#### inputSchema.properties.includeDetails.description

> **description**: `string` = `'Include detailed breakdown per dimension'`

#### inputSchema.properties.includeDetails.type

> **type**: `string` = `'boolean'`

#### inputSchema.properties.mepId

> **mepId**: `object`

#### inputSchema.properties.mepId.description

> **description**: `string` = `'MEP identifier'`

#### inputSchema.properties.mepId.maxLength

> **maxLength**: `number` = `100`

#### inputSchema.properties.mepId.minLength

> **minLength**: `number` = `1`

#### inputSchema.properties.mepId.type

> **type**: `string` = `'string'`

#### inputSchema.required

> **required**: `string`[]

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'assess_mep_influence'`
