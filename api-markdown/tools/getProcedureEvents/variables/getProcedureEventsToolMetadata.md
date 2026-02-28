[**European Parliament MCP Server API v0.9.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getProcedureEvents](../README.md) / getProcedureEventsToolMetadata

# Variable: getProcedureEventsToolMetadata

> `const` **getProcedureEventsToolMetadata**: `object`

Defined in: [tools/getProcedureEvents.ts:66](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getProcedureEvents.ts#L66)

Tool metadata for get_procedure_events

## Type Declaration

### description

> **description**: `string` = `'Get events linked to a specific EP legislative procedure (hearings, debates, votes). Returns the timeline of events for a procedure. Data source: European Parliament Open Data Portal.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

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

#### inputSchema.properties.processId

> **processId**: `object`

#### inputSchema.properties.processId.description

> **description**: `string` = `'Procedure process ID (required)'`

#### inputSchema.properties.processId.type

> **type**: `string` = `'string'`

#### inputSchema.required

> **required**: `string`[]

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'get_procedure_events'`
