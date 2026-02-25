[**European Parliament MCP Server API v0.7.3**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/trackMepAttendance](../README.md) / trackMepAttendanceToolMetadata

# Variable: trackMepAttendanceToolMetadata

> `const` **trackMepAttendanceToolMetadata**: `object`

Defined in: [tools/trackMepAttendance.ts:341](https://github.com/Hack23/European-Parliament-MCP-Server/blob/c844f163befb571516b5718c5d197eff1e589dea/src/tools/trackMepAttendance.ts#L341)

Tool metadata for MCP listing

## Type Declaration

### description

> **description**: `string` = `'Track and analyze MEP attendance patterns across plenary sessions. Provides attendance rates, trends, and engagement categorization. Filter by individual MEP, country, or political group.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.country

> **country**: `object`

#### inputSchema.properties.country.description

> **description**: `string` = `'Filter by country (ISO 3166-1 alpha-2)'`

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

#### inputSchema.properties.groupId

> **groupId**: `object`

#### inputSchema.properties.groupId.description

> **description**: `string` = `'Filter by political group'`

#### inputSchema.properties.groupId.type

> **type**: `string` = `'string'`

#### inputSchema.properties.limit

> **limit**: `object`

#### inputSchema.properties.limit.description

> **description**: `string` = `'Maximum number of MEPs to return (default: 20)'`

#### inputSchema.properties.limit.type

> **type**: `string` = `'number'`

#### inputSchema.properties.mepId

> **mepId**: `object`

#### inputSchema.properties.mepId.description

> **description**: `string` = `'MEP identifier (omit for group/country overview)'`

#### inputSchema.properties.mepId.type

> **type**: `string` = `'string'`

#### inputSchema.required

> **required**: `never`[] = `[]`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'track_mep_attendance'`
