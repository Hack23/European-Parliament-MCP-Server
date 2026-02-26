[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getMeetingActivities](../README.md) / getMeetingActivitiesToolMetadata

# Variable: getMeetingActivitiesToolMetadata

> `const` **getMeetingActivitiesToolMetadata**: `object`

Defined in: [tools/getMeetingActivities.ts:58](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/tools/getMeetingActivities.ts#L58)

Tool metadata for get_meeting_activities

## Type Declaration

### description

> **description**: `string` = `'Get activities linked to a specific EP plenary sitting (debates, votes, presentations). Requires a sitting ID. Data source: European Parliament Open Data Portal.'`

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

> **name**: `string` = `'get_meeting_activities'`
