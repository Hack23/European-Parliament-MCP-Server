[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/comparePoliticalGroups](../README.md) / comparePoliticalGroupsToolMetadata

# Variable: comparePoliticalGroupsToolMetadata

> `const` **comparePoliticalGroupsToolMetadata**: `object`

Defined in: [tools/comparePoliticalGroups.ts:239](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/comparePoliticalGroups.ts#L239)

Tool metadata for MCP registration

## Type Declaration

### description

> **description**: `string` = `'Compare political groups across multiple dimensions: voting discipline, activity level, legislative output, attendance, and cohesion. Returns rankings, computed performance scores, seat share, effectiveness per member, parliamentary balance index, and competitive index.'`

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

#### inputSchema.properties.dimensions

> **dimensions**: `object`

#### inputSchema.properties.dimensions.description

> **description**: `string` = `'Comparison dimensions (omit for all)'`

#### inputSchema.properties.dimensions.items

> **items**: `object`

#### inputSchema.properties.dimensions.items.enum

> **enum**: `string`[]

#### inputSchema.properties.dimensions.items.type

> **type**: `string` = `'string'`

#### inputSchema.properties.dimensions.type

> **type**: `string` = `'array'`

#### inputSchema.properties.groupIds

> **groupIds**: `object`

#### inputSchema.properties.groupIds.description

> **description**: `string` = `'Political group identifiers to compare (minimum 2)'`

#### inputSchema.properties.groupIds.items

> **items**: `object`

#### inputSchema.properties.groupIds.items.type

> **type**: `string` = `'string'`

#### inputSchema.properties.groupIds.maxItems

> **maxItems**: `number` = `10`

#### inputSchema.properties.groupIds.minItems

> **minItems**: `number` = `2`

#### inputSchema.properties.groupIds.type

> **type**: `string` = `'array'`

#### inputSchema.required

> **required**: `string`[]

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'compare_political_groups'`
