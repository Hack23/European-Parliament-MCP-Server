[**European Parliament MCP Server API v0.8.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getVotingRecords](../README.md) / getVotingRecordsToolMetadata

# Variable: getVotingRecordsToolMetadata

> `const` **getVotingRecordsToolMetadata**: `object`

Defined in: [tools/getVotingRecords.ts:78](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/tools/getVotingRecords.ts#L78)

Tool metadata for MCP registration

## Type Declaration

### description

> **description**: `string` = `'Retrieve voting records from European Parliament plenary sessions. Filter by session, MEP, topic, or date range. Returns vote counts (for/against/abstain), final result, and optionally individual MEP votes.'`

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

#### inputSchema.properties.mepId

> **mepId**: `object`

#### inputSchema.properties.mepId.description

> **description**: `string` = `'MEP identifier to filter votes by specific MEP'`

#### inputSchema.properties.mepId.maxLength

> **maxLength**: `number` = `100`

#### inputSchema.properties.mepId.minLength

> **minLength**: `number` = `1`

#### inputSchema.properties.mepId.type

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

#### inputSchema.properties.sessionId

> **sessionId**: `object`

#### inputSchema.properties.sessionId.description

> **description**: `string` = `'Plenary session identifier'`

#### inputSchema.properties.sessionId.maxLength

> **maxLength**: `number` = `100`

#### inputSchema.properties.sessionId.minLength

> **minLength**: `number` = `1`

#### inputSchema.properties.sessionId.type

> **type**: `string` = `'string'`

#### inputSchema.properties.topic

> **topic**: `object`

#### inputSchema.properties.topic.description

> **description**: `string` = `'Vote topic or keyword to search'`

#### inputSchema.properties.topic.maxLength

> **maxLength**: `number` = `200`

#### inputSchema.properties.topic.minLength

> **minLength**: `number` = `1`

#### inputSchema.properties.topic.type

> **type**: `string` = `'string'`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'get_voting_records'`
