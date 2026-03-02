[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/generateReport](../README.md) / generateReportToolMetadata

# Variable: generateReportToolMetadata

> `const` **generateReportToolMetadata**: `object`

Defined in: [tools/generateReport/index.ts:109](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/generateReport/index.ts#L109)

Tool metadata for MCP registration

## Type Declaration

### description

> **description**: `string` = `'Generate comprehensive analytical reports on European Parliament data. Supports MEP activity reports, committee performance reports, voting statistics, and legislation progress reports. Returns structured report with summary, sections, statistics, and recommendations.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.dateFrom

> **dateFrom**: `object`

#### inputSchema.properties.dateFrom.description

> **description**: `string` = `'Report period start date (YYYY-MM-DD format)'`

#### inputSchema.properties.dateFrom.pattern

> **pattern**: `string` = `'^\\d{4}-\\d{2}-\\d{2}$'`

#### inputSchema.properties.dateFrom.type

> **type**: `string` = `'string'`

#### inputSchema.properties.dateTo

> **dateTo**: `object`

#### inputSchema.properties.dateTo.description

> **description**: `string` = `'Report period end date (YYYY-MM-DD format)'`

#### inputSchema.properties.dateTo.pattern

> **pattern**: `string` = `'^\\d{4}-\\d{2}-\\d{2}$'`

#### inputSchema.properties.dateTo.type

> **type**: `string` = `'string'`

#### inputSchema.properties.reportType

> **reportType**: `object`

#### inputSchema.properties.reportType.description

> **description**: `string` = `'Type of report to generate'`

#### inputSchema.properties.reportType.enum

> **enum**: `string`[]

#### inputSchema.properties.reportType.type

> **type**: `string` = `'string'`

#### inputSchema.properties.subjectId

> **subjectId**: `object`

#### inputSchema.properties.subjectId.description

> **description**: `string` = `'Subject identifier (MEP ID, Committee ID, etc.) - optional for aggregate reports'`

#### inputSchema.properties.subjectId.maxLength

> **maxLength**: `number` = `100`

#### inputSchema.properties.subjectId.minLength

> **minLength**: `number` = `1`

#### inputSchema.properties.subjectId.type

> **type**: `string` = `'string'`

#### inputSchema.required

> **required**: `string`[]

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'generate_report'`
