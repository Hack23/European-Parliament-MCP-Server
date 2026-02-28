[**European Parliament MCP Server API v0.9.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/monitorLegislativePipeline](../README.md) / monitorLegislativePipelineToolMetadata

# Variable: monitorLegislativePipelineToolMetadata

> `const` **monitorLegislativePipelineToolMetadata**: `object`

Defined in: [tools/monitorLegislativePipeline.ts:343](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/monitorLegislativePipeline.ts#L343)

Tool metadata for MCP registration

## Type Declaration

### description

> **description**: `string` = `'Monitor legislative pipeline status with bottleneck detection and timeline forecasting. Tracks procedures through stages (proposal → committee → plenary → trilogue → adoption). Returns pipeline health score, throughput rate, bottleneck index, stalled procedure rate, and legislative momentum assessment.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.committee

> **committee**: `object`

#### inputSchema.properties.committee.description

> **description**: `string` = `'Filter by committee'`

#### inputSchema.properties.committee.maxLength

> **maxLength**: `number` = `100`

#### inputSchema.properties.committee.minLength

> **minLength**: `number` = `1`

#### inputSchema.properties.committee.type

> **type**: `string` = `'string'`

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

#### inputSchema.properties.limit

> **limit**: `object`

#### inputSchema.properties.limit.default

> **default**: `number` = `20`

#### inputSchema.properties.limit.description

> **description**: `string` = `'Maximum results to return (1-100)'`

#### inputSchema.properties.limit.maximum

> **maximum**: `number` = `100`

#### inputSchema.properties.limit.minimum

> **minimum**: `number` = `1`

#### inputSchema.properties.limit.type

> **type**: `string` = `'number'`

#### inputSchema.properties.status

> **status**: `object`

#### inputSchema.properties.status.default

> **default**: `string` = `'ACTIVE'`

#### inputSchema.properties.status.description

> **description**: `string` = `'Pipeline status filter'`

#### inputSchema.properties.status.enum

> **enum**: `string`[]

#### inputSchema.properties.status.type

> **type**: `string` = `'string'`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'monitor_legislative_pipeline'`
