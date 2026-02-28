[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getAllGeneratedStats](../README.md) / getAllGeneratedStatsToolMetadata

# Variable: getAllGeneratedStatsToolMetadata

> `const` **getAllGeneratedStatsToolMetadata**: `object`

Defined in: [tools/getAllGeneratedStats.ts:288](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getAllGeneratedStats.ts#L288)

## Type Declaration

### description

> **description**: `string`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.category

> **category**: `object`

#### inputSchema.properties.category.default

> **default**: `string` = `'all'`

#### inputSchema.properties.category.description

> **description**: `string` = `'Activity category to focus on (default: all)'`

#### inputSchema.properties.category.enum

> **enum**: `string`[]

#### inputSchema.properties.category.type

> **type**: `string` = `'string'`

#### inputSchema.properties.includeMonthlyBreakdown

> **includeMonthlyBreakdown**: `object`

#### inputSchema.properties.includeMonthlyBreakdown.default

> **default**: `boolean` = `false`

#### inputSchema.properties.includeMonthlyBreakdown.description

> **description**: `string` = `'Include month-by-month activity data (default: false)'`

#### inputSchema.properties.includeMonthlyBreakdown.type

> **type**: `string` = `'boolean'`

#### inputSchema.properties.includePredictions

> **includePredictions**: `object`

#### inputSchema.properties.includePredictions.default

> **default**: `boolean` = `true`

#### inputSchema.properties.includePredictions.description

> **description**: `string` = `'Include trend-based predictions for 2026-2030 (default: true)'`

#### inputSchema.properties.includePredictions.type

> **type**: `string` = `'boolean'`

#### inputSchema.properties.includeRankings

> **includeRankings**: `object`

#### inputSchema.properties.includeRankings.default

> **default**: `boolean` = `true`

#### inputSchema.properties.includeRankings.description

> **description**: `string` = `'Include percentile rankings and statistics (default: true)'`

#### inputSchema.properties.includeRankings.type

> **type**: `string` = `'boolean'`

#### inputSchema.properties.yearFrom

> **yearFrom**: `object`

#### inputSchema.properties.yearFrom.description

> **description**: `string` = `'Start year for filtering (default: 2004)'`

#### inputSchema.properties.yearFrom.maximum

> **maximum**: `number` = `2030`

#### inputSchema.properties.yearFrom.minimum

> **minimum**: `number` = `2004`

#### inputSchema.properties.yearFrom.type

> **type**: `string` = `'number'`

#### inputSchema.properties.yearTo

> **yearTo**: `object`

#### inputSchema.properties.yearTo.description

> **description**: `string` = `'End year for filtering (default: 2025)'`

#### inputSchema.properties.yearTo.maximum

> **maximum**: `number` = `2030`

#### inputSchema.properties.yearTo.minimum

> **minimum**: `number` = `2004`

#### inputSchema.properties.yearTo.type

> **type**: `string` = `'number'`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'get_all_generated_stats'`
