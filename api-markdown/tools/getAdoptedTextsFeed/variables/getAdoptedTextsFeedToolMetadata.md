[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getAdoptedTextsFeed](../README.md) / getAdoptedTextsFeedToolMetadata

# Variable: getAdoptedTextsFeedToolMetadata

> `const` **getAdoptedTextsFeedToolMetadata**: `object`

Defined in: [tools/getAdoptedTextsFeed.ts:35](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getAdoptedTextsFeed.ts#L35)

Tool metadata for get_adopted_texts_feed

## Type Declaration

### description

> **description**: `string` = `'Get recently updated European Parliament adopted texts from the feed. Returns adopted texts published or updated during the specified timeframe. Data source: European Parliament Open Data Portal.'`

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

#### inputSchema.properties.workType

> **workType**: `object`

#### inputSchema.properties.workType.description

> **description**: `string` = `'Work type filter'`

#### inputSchema.properties.workType.type

> **type**: `string` = `'string'`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'get_adopted_texts_feed'`
