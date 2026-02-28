[**European Parliament MCP Server API v0.9.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/analyzeLegislativeEffectiveness](../README.md) / analyzeLegislativeEffectivenessToolMetadata

# Variable: analyzeLegislativeEffectivenessToolMetadata

> `const` **analyzeLegislativeEffectivenessToolMetadata**: `object`

Defined in: [tools/analyzeLegislativeEffectiveness.ts:278](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/analyzeLegislativeEffectiveness.ts#L278)

Tool metadata for MCP registration

## Type Declaration

### description

> **description**: `string` = `'Analyze legislative effectiveness of an MEP or committee. Computes productivity, quality, and impact scores from reports authored, amendments adopted, and voting participation. Returns effectiveness ranking, peer benchmarks, amendment success rate, output per month, and percentile comparison.'`

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

#### inputSchema.properties.subjectId

> **subjectId**: `object`

#### inputSchema.properties.subjectId.description

> **description**: `string` = `'Subject identifier (MEP ID or committee abbreviation)'`

#### inputSchema.properties.subjectId.maxLength

> **maxLength**: `number` = `100`

#### inputSchema.properties.subjectId.minLength

> **minLength**: `number` = `1`

#### inputSchema.properties.subjectId.type

> **type**: `string` = `'string'`

#### inputSchema.properties.subjectType

> **subjectType**: `object`

#### inputSchema.properties.subjectType.description

> **description**: `string` = `'Subject type to analyze'`

#### inputSchema.properties.subjectType.enum

> **enum**: `string`[]

#### inputSchema.properties.subjectType.type

> **type**: `string` = `'string'`

#### inputSchema.required

> **required**: `string`[]

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'analyze_legislative_effectiveness'`
