[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/analyzeCoalitionDynamics](../README.md) / analyzeCoalitionDynamicsToolMetadata

# Variable: analyzeCoalitionDynamicsToolMetadata

> `const` **analyzeCoalitionDynamicsToolMetadata**: `object`

Defined in: [tools/analyzeCoalitionDynamics.ts:299](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/tools/analyzeCoalitionDynamics.ts#L299)

Tool metadata for MCP registration

## Type Declaration

### description

> **description**: `string` = `'Analyze political group coalition dynamics including cohesion rates, cross-party alliances, defection rates, and stress indicators. Computes parliamentary fragmentation index, effective number of parties, grand coalition viability, and opposition strength. Uses CIA Coalition Analysis methodology.'`

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

#### inputSchema.properties.groupIds

> **groupIds**: `object`

#### inputSchema.properties.groupIds.description

> **description**: `string` = `'Political group identifiers to analyze (omit for all groups)'`

#### inputSchema.properties.groupIds.items

> **items**: `object`

#### inputSchema.properties.groupIds.items.type

> **type**: `string` = `'string'`

#### inputSchema.properties.groupIds.maxItems

> **maxItems**: `number` = `10`

#### inputSchema.properties.groupIds.minItems

> **minItems**: `number` = `1`

#### inputSchema.properties.groupIds.type

> **type**: `string` = `'array'`

#### inputSchema.properties.minimumCohesion

> **minimumCohesion**: `object`

#### inputSchema.properties.minimumCohesion.default

> **default**: `number` = `0.5`

#### inputSchema.properties.minimumCohesion.description

> **description**: `string` = `'Minimum cohesion threshold for alliance detection (0-1)'`

#### inputSchema.properties.minimumCohesion.maximum

> **maximum**: `number` = `1`

#### inputSchema.properties.minimumCohesion.minimum

> **minimum**: `number` = `0`

#### inputSchema.properties.minimumCohesion.type

> **type**: `string` = `'number'`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'analyze_coalition_dynamics'`
