[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/sentimentTracker](../README.md) / sentimentTrackerToolMetadata

# Variable: sentimentTrackerToolMetadata

> `const` **sentimentTrackerToolMetadata**: `object`

Defined in: [tools/sentimentTracker.ts:303](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/sentimentTracker.ts#L303)

## Type Declaration

### description

> **description**: `string` = `'Track political group institutional-positioning scores based on seat-share proxy (not direct voting cohesion data, which is unavailable from the EP API). Computes scores (-1 to +1), polarization index, and identifies consensus and divisive topics. NOTE: timeframe parameter is informational-only; scores always reflect current group composition.'`

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

> **description**: `string` = `'Informational-only time window label (scores always use latest group composition data)'`

#### inputSchema.properties.timeframe.enum

> **enum**: `string`[]

#### inputSchema.properties.timeframe.type

> **type**: `string` = `'string'`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'sentiment_tracker'`
