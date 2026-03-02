[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getProcedureEventById](../README.md) / getProcedureEventByIdToolMetadata

# Variable: getProcedureEventByIdToolMetadata

> `const` **getProcedureEventByIdToolMetadata**: `object`

Defined in: [tools/getProcedureEventById.ts:31](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getProcedureEventById.ts#L31)

Tool metadata for get_procedure_event_by_id

## Type Declaration

### description

> **description**: `string` = `'Get a specific event linked to a legislative procedure. Returns a single event for the specified procedure and event identifiers. Data source: European Parliament Open Data Portal.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.eventId

> **eventId**: `object`

#### inputSchema.properties.eventId.description

> **description**: `string` = `'Event identifier'`

#### inputSchema.properties.eventId.type

> **type**: `string` = `'string'`

#### inputSchema.properties.processId

> **processId**: `object`

#### inputSchema.properties.processId.description

> **description**: `string` = `'Procedure process ID'`

#### inputSchema.properties.processId.type

> **type**: `string` = `'string'`

#### inputSchema.required

> **required**: `string`[]

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'get_procedure_event_by_id'`
