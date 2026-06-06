[**European Parliament MCP Server API v1.3.16**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/sentimentTracker](../README.md) / sentimentTrackerToolMetadata

# Variable: sentimentTrackerToolMetadata

> `const` **sentimentTrackerToolMetadata**: `object`

Defined in: [tools/sentimentTracker.ts:876](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/sentimentTracker.ts#L876)

MCP tool metadata for `sentiment_tracker` (name, description, and
JSON Schema for the tool's input). Consumed by the server's tool
registry to advertise this tool in `ListTools` responses.

## Type Declaration

### description

> **description**: `string` = `'Track political group sentiment over a configurable time window. Combines current EP API MEP composition with DOCEO roll-call vote (RCV) cohesion / defection data aggregated across last_month (~30d), last_quarter (~90d) or last_year (~365d). Returns per-group sentiment scores (-1 to +1), IMPROVING/STABLE/DECLINING/VOLATILE trends derived from half-window and sub-window DOCEO cohesion deltas, polarization index (1 − seat-share-weighted mean cohesion), and consensus/divisive vote subjects. Falls back to seat-share proxy with confidenceLevel=LOW when DOCEO coverage is insufficient.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.groupId

> **groupId**: `object`

#### inputSchema.properties.groupId.description

> **description**: `string` = `'Political group ID to track (omit for all groups)'`

#### inputSchema.properties.groupId.maxLength

> **maxLength**: `number` = `50`

#### inputSchema.properties.groupId.minLength

> **minLength**: `number` = `1`

#### inputSchema.properties.groupId.type

> **type**: `string` = `'string'`

#### inputSchema.properties.timeframe

> **timeframe**: `object`

#### inputSchema.properties.timeframe.default

> **default**: `string` = `'last_quarter'`

#### inputSchema.properties.timeframe.description

> **description**: `string` = `'DOCEO RCV aggregation window: last_month (~30d), last_quarter (~90d), or last_year (~365d). Falls back to seat-share-only proxy with confidenceLevel=LOW when DOCEO coverage is insufficient.'`

#### inputSchema.properties.timeframe.enum

> **enum**: `string`[]

#### inputSchema.properties.timeframe.type

> **type**: `string` = `'string'`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'sentiment_tracker'`
