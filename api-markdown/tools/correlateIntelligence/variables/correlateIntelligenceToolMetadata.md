[**European Parliament MCP Server API v1.0.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/correlateIntelligence](../README.md) / correlateIntelligenceToolMetadata

# Variable: correlateIntelligenceToolMetadata

> `const` **correlateIntelligenceToolMetadata**: `object`

Defined in: [tools/correlateIntelligence.ts:897](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/correlateIntelligence.ts#L897)

MCP tool metadata for `correlate_intelligence` registration.

## Type Declaration

### description

> **description**: `string`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.groups

> **groups**: `object`

#### inputSchema.properties.groups.description

> **description**: `string` = `'Political groups for coalition fracture analysis (omit to use all major groups)'`

#### inputSchema.properties.groups.items

> **items**: `object`

#### inputSchema.properties.groups.items.maxLength

> **maxLength**: `number` = `50`

#### inputSchema.properties.groups.items.minLength

> **minLength**: `number` = `1`

#### inputSchema.properties.groups.items.type

> **type**: `string` = `'string'`

#### inputSchema.properties.groups.maxItems

> **maxItems**: `number` = `8`

#### inputSchema.properties.groups.type

> **type**: `string` = `'array'`

#### inputSchema.properties.includeNetworkAnalysis

> **includeNetworkAnalysis**: `object`

#### inputSchema.properties.includeNetworkAnalysis.default

> **default**: `boolean` = `false`

#### inputSchema.properties.includeNetworkAnalysis.description

> **description**: `string` = `'Run network centrality analysis (increases response time)'`

#### inputSchema.properties.includeNetworkAnalysis.type

> **type**: `string` = `'boolean'`

#### inputSchema.properties.mepIds

> **mepIds**: `object`

#### inputSchema.properties.mepIds.description

> **description**: `string` = `'MEP identifiers to cross-correlate (1–5 MEPs)'`

#### inputSchema.properties.mepIds.items

> **items**: `object`

#### inputSchema.properties.mepIds.items.maxLength

> **maxLength**: `number` = `100`

#### inputSchema.properties.mepIds.items.minLength

> **minLength**: `number` = `1`

#### inputSchema.properties.mepIds.items.type

> **type**: `string` = `'string'`

#### inputSchema.properties.mepIds.maxItems

> **maxItems**: `number` = `5`

#### inputSchema.properties.mepIds.minItems

> **minItems**: `number` = `1`

#### inputSchema.properties.mepIds.type

> **type**: `string` = `'array'`

#### inputSchema.properties.sensitivityLevel

> **sensitivityLevel**: `object`

#### inputSchema.properties.sensitivityLevel.default

> **default**: `string` = `'MEDIUM'`

#### inputSchema.properties.sensitivityLevel.description

> **description**: `string` = `'Alert sensitivity — HIGH surfaces more signals, LOW reduces noise'`

#### inputSchema.properties.sensitivityLevel.enum

> **enum**: `string`[]

#### inputSchema.properties.sensitivityLevel.type

> **type**: `string` = `'string'`

#### inputSchema.required

> **required**: `string`[]

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'correlate_intelligence'`
