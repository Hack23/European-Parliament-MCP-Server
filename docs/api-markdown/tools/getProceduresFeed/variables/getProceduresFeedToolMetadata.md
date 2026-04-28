[**European Parliament MCP Server API v1.2.16**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getProceduresFeed](../README.md) / getProceduresFeedToolMetadata

# Variable: getProceduresFeedToolMetadata

> `const` **getProceduresFeedToolMetadata**: `object`

Defined in: [tools/getProceduresFeed.ts:313](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getProceduresFeed.ts#L313)

Tool metadata for get_procedures_feed

## Type Declaration

### description

> **description**: `string` = `'Get recently updated European Parliament procedures from the feed. Returns procedures published or updated during the specified timeframe. Data source: European Parliament Open Data Portal. NOTE: The EP API procedures/feed endpoint is significantly slower than other feeds — "one-month" queries may take around 120 seconds and can still time out. If you see timeouts, increase the global timeout with --timeout or EP_REQUEST_TIMEOUT_MS. When no procedures were updated in the requested timeframe (common during parliamentary recess or low-activity periods), the response will have status:"unavailable" and empty items — this is expected behaviour, not an error. In that case, use get_procedures (with limit/offset) to browse a paginated list of procedures as a reliable fallback. The response also surfaces a STALENESS_WARNING entry in dataQualityWarnings whenever the upstream returns historical-tail ordering with no current-year items (a known degraded-upstream pattern), so consumers can detect the regression programmatically.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.processType

> **processType**: `object`

#### inputSchema.properties.processType.description

> **description**: `string` = `'Process type filter'`

#### inputSchema.properties.processType.type

> **type**: `string` = `'string'`

#### inputSchema.properties.startDate

> **startDate**: `object`

#### inputSchema.properties.startDate.description

> **description**: `string` = `'Start date (YYYY-MM-DD) — required when timeframe is "custom"'`

#### inputSchema.properties.startDate.type

> **type**: `string` = `'string'`

#### inputSchema.properties.timeframe

> **timeframe**: `object`

#### inputSchema.properties.timeframe.default

> **default**: `string` = `'one-week'`

#### inputSchema.properties.timeframe.description

> **description**: `string` = `'Timeframe for the feed (today, one-day, one-week, one-month, custom)'`

#### inputSchema.properties.timeframe.enum

> **enum**: `string`[]

#### inputSchema.properties.timeframe.type

> **type**: `string` = `'string'`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'get_procedures_feed'`
