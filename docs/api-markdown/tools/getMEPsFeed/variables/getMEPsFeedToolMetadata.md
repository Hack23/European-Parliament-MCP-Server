[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getMEPsFeed](../README.md) / getMEPsFeedToolMetadata

# Variable: getMEPsFeedToolMetadata

> `const` **getMEPsFeedToolMetadata**: `object`

Defined in: [tools/getMEPsFeed.ts:34](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getMEPsFeed.ts#L34)

Tool metadata for get_meps_feed

## Type Declaration

### description

> **description**: `string` = `'Get recently updated MEPs from the European Parliament feed. Returns MEPs published or updated during the specified timeframe. Data source: European Parliament Open Data Portal.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

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

> **name**: `string` = `'get_meps_feed'`
