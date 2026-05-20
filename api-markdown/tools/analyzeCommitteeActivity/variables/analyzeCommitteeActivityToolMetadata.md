[**European Parliament MCP Server API v1.3.9**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/analyzeCommitteeActivity](../README.md) / analyzeCommitteeActivityToolMetadata

# Variable: analyzeCommitteeActivityToolMetadata

> `const` **analyzeCommitteeActivityToolMetadata**: `object`

Defined in: [tools/analyzeCommitteeActivity.ts:752](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/analyzeCommitteeActivity.ts#L752)

Tool metadata for MCP listing

## Type Declaration

### description

> **description**: `string` = `'Analyze European Parliament committee workload, meeting frequency, document production, decisions adopted, legislative output, and member engagement. Fans out four EP sources in parallel with per-source timeouts and reports data availability per source.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.committeeId

> **committeeId**: `object`

#### inputSchema.properties.committeeId.description

> **description**: `string` = `'Committee identifier or abbreviation (e.g., "ENVI", "ITRE")'`

#### inputSchema.properties.committeeId.type

> **type**: `string` = `'string'`

#### inputSchema.properties.dateFrom

> **dateFrom**: `object`

#### inputSchema.properties.dateFrom.description

> **description**: `string` = `'Start date (YYYY-MM-DD). Defaults to trailing 6 months.'`

#### inputSchema.properties.dateFrom.type

> **type**: `string` = `'string'`

#### inputSchema.properties.dateTo

> **dateTo**: `object`

#### inputSchema.properties.dateTo.description

> **description**: `string` = `'End date (YYYY-MM-DD). Defaults to today.'`

#### inputSchema.properties.dateTo.type

> **type**: `string` = `'string'`

#### inputSchema.required

> **required**: `string`[]

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'analyze_committee_activity'`
