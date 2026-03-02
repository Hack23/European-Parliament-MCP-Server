[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getMeetingDecisions](../README.md) / getMeetingDecisionsToolMetadata

# Variable: getMeetingDecisionsToolMetadata

> `const` **getMeetingDecisionsToolMetadata**: `object`

Defined in: [tools/getMeetingDecisions.ts:58](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getMeetingDecisions.ts#L58)

Tool metadata for get_meeting_decisions

## Type Declaration

### description

> **description**: `string` = `'Get decisions made in a specific EP plenary sitting. Returns adopted decisions and voting outcomes. Requires a sitting ID. Data source: European Parliament Open Data Portal.'`

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

#### inputSchema.properties.sittingId

> **sittingId**: `object`

#### inputSchema.properties.sittingId.description

> **description**: `string` = `'Meeting / sitting identifier (required)'`

#### inputSchema.properties.sittingId.type

> **type**: `string` = `'string'`

#### inputSchema.required

> **required**: `string`[]

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'get_meeting_decisions'`
