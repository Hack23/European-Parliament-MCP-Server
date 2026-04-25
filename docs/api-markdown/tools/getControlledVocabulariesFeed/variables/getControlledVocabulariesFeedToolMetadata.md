[**European Parliament MCP Server API v1.2.14**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getControlledVocabulariesFeed](../README.md) / getControlledVocabulariesFeedToolMetadata

# Variable: getControlledVocabulariesFeedToolMetadata

> `const` **getControlledVocabulariesFeedToolMetadata**: `object`

Defined in: [tools/getControlledVocabulariesFeed.ts:67](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getControlledVocabulariesFeed.ts#L67)

Tool metadata for get_controlled_vocabularies_feed

## Type Declaration

### description

> **description**: `string` = `'Get recently updated controlled vocabularies from the EP Open Data Portal feed. This is a fixed-window feed — the upstream EP API always returns items updated within a server-defined default window (typically one month). For contract uniformity with sliding-window feed tools, the common feed parameters (timeframe, startDate, limit, offset) are accepted but informational-only — they are silently ignored. Data source: European Parliament Open Data Portal.'`

### inputSchema

> **inputSchema**: `object` = `FIXED_WINDOW_FEED_INPUT_SCHEMA`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.limit

> **limit**: `object`

#### inputSchema.properties.limit.description

> **description**: `string` = `'Informational-only — the upstream EP API does not paginate this fixed-window feed. Accepted for contract uniformity.'`

#### inputSchema.properties.limit.maximum

> **maximum**: `number` = `100`

#### inputSchema.properties.limit.minimum

> **minimum**: `number` = `1`

#### inputSchema.properties.limit.type

> **type**: `string` = `'number'`

#### inputSchema.properties.offset

> **offset**: `object`

#### inputSchema.properties.offset.description

> **description**: `string` = `'Informational-only — the upstream EP API does not paginate this fixed-window feed. Accepted for contract uniformity.'`

#### inputSchema.properties.offset.minimum

> **minimum**: `number` = `0`

#### inputSchema.properties.offset.type

> **type**: `string` = `'number'`

#### inputSchema.properties.startDate

> **startDate**: `object`

#### inputSchema.properties.startDate.description

> **description**: `string` = `'Informational-only — ignored by this fixed-window feed. Accepted for contract uniformity with sliding-window feed tools.'`

#### inputSchema.properties.startDate.type

> **type**: `string` = `'string'`

#### inputSchema.properties.timeframe

> **timeframe**: `object`

#### inputSchema.properties.timeframe.description

> **description**: `string` = `'Informational-only — this feed uses a server-defined default window (typically one month) and ignores this parameter. Accepted for contract uniformity with sliding-window feed tools.'`

#### inputSchema.properties.timeframe.enum

> **enum**: `string`[]

#### inputSchema.properties.timeframe.type

> **type**: `string` = `'string'`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'get_controlled_vocabularies_feed'`
