[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getEvents](../README.md) / getEventsToolMetadata

# Variable: getEventsToolMetadata

> `const` **getEventsToolMetadata**: `object`

Defined in: [tools/getEvents.ts:54](https://github.com/Hack23/European-Parliament-MCP-Server/blob/006b62840b740489118388cc87b431ee92a42c24/src/tools/getEvents.ts#L54)

Tool metadata for get_events

## Type Declaration

### description

> **description**: `string` = `'Get European Parliament events including hearings, conferences, seminars, and institutional events. Supports single event lookup by eventId or list with date range filtering. Data source: European Parliament Open Data Portal.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

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

#### inputSchema.properties.eventId

> **eventId**: `object`

#### inputSchema.properties.eventId.description

> **description**: `string` = `'Event ID for single event lookup'`

#### inputSchema.properties.eventId.type

> **type**: `string` = `'string'`

#### inputSchema.properties.limit

> **limit**: `object`

#### inputSchema.properties.limit.default

> **default**: `number` = `50`

#### inputSchema.properties.limit.description

> **description**: `string` = `'Maximum results to return (1-100)'`

#### inputSchema.properties.limit.type

> **type**: `string` = `'number'`

#### inputSchema.properties.offset

> **offset**: `object`

#### inputSchema.properties.offset.default

> **default**: `number` = `0`

#### inputSchema.properties.offset.description

> **description**: `string` = `'Pagination offset'`

#### inputSchema.properties.offset.type

> **type**: `string` = `'number'`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'get_events'`
