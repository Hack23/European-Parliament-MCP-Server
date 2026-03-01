[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getPlenarySessions](../README.md) / getPlenarySessionsToolMetadata

# Variable: getPlenarySessionsToolMetadata

> `const` **getPlenarySessionsToolMetadata**: `object`

Defined in: [tools/getPlenarySessions.ts:113](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getPlenarySessions.ts#L113)

Tool metadata for MCP registration

## Type Declaration

### description

> **description**: `string` = `'Retrieve European Parliament plenary sessions/meetings. Supports single meeting lookup by eventId or list with date and location filters. Returns session details including date, location, agenda items, voting records, and attendance statistics.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.dateFrom

> **dateFrom**: `object`

#### inputSchema.properties.dateFrom.description

> **description**: `string` = `'Start date filter (YYYY-MM-DD format)'`

#### inputSchema.properties.dateFrom.pattern

> **pattern**: `string` = `'^\\d{4}-\\d{2}-\\d{2}$'`

#### inputSchema.properties.dateFrom.type

> **type**: `string` = `'string'`

#### inputSchema.properties.dateTo

> **dateTo**: `object`

#### inputSchema.properties.dateTo.description

> **description**: `string` = `'End date filter (YYYY-MM-DD format)'`

#### inputSchema.properties.dateTo.pattern

> **pattern**: `string` = `'^\\d{4}-\\d{2}-\\d{2}$'`

#### inputSchema.properties.dateTo.type

> **type**: `string` = `'string'`

#### inputSchema.properties.eventId

> **eventId**: `object`

#### inputSchema.properties.eventId.description

> **description**: `string` = `'Meeting event ID for single meeting lookup'`

#### inputSchema.properties.eventId.type

> **type**: `string` = `'string'`

#### inputSchema.properties.limit

> **limit**: `object`

#### inputSchema.properties.limit.default

> **default**: `number` = `50`

#### inputSchema.properties.limit.description

> **description**: `string` = `'Maximum number of results to return (1-100)'`

#### inputSchema.properties.limit.maximum

> **maximum**: `number` = `100`

#### inputSchema.properties.limit.minimum

> **minimum**: `number` = `1`

#### inputSchema.properties.limit.type

> **type**: `string` = `'number'`

#### inputSchema.properties.location

> **location**: `object`

#### inputSchema.properties.location.description

> **description**: `string` = `'Session location (e.g., "Strasbourg", "Brussels")'`

#### inputSchema.properties.location.maxLength

> **maxLength**: `number` = `100`

#### inputSchema.properties.location.minLength

> **minLength**: `number` = `1`

#### inputSchema.properties.location.type

> **type**: `string` = `'string'`

#### inputSchema.properties.offset

> **offset**: `object`

#### inputSchema.properties.offset.default

> **default**: `number` = `0`

#### inputSchema.properties.offset.description

> **description**: `string` = `'Pagination offset'`

#### inputSchema.properties.offset.minimum

> **minimum**: `number` = `0`

#### inputSchema.properties.offset.type

> **type**: `string` = `'number'`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'get_plenary_sessions'`
