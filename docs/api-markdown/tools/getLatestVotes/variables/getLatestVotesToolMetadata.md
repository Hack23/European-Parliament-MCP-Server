[**European Parliament MCP Server API v1.3.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getLatestVotes](../README.md) / getLatestVotesToolMetadata

# Variable: getLatestVotesToolMetadata

> `const` **getLatestVotesToolMetadata**: `object`

Defined in: [tools/getLatestVotes.ts:157](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getLatestVotes.ts#L157)

Tool metadata for MCP registration

## Type Declaration

### description

> **description**: `string` = `'Retrieve the latest plenary votes from EP DOCEO XML documents. Provides near-real-time access to roll-call votes (individual MEP positions by political group) and vote results (aggregate tallies). This data source is fresher than the EP Open Data API which has a multi-week publication delay. Use for up-to-date political intelligence on voting patterns, coalition analysis, and group cohesion tracking.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.date

> **date**: `object`

#### inputSchema.properties.date.description

> **description**: `string` = `'Specific date to fetch votes for (YYYY-MM-DD). Mutually exclusive with weekStart. If omitted, fetches the requested or most recent plenary week (Mon-Thu).'`

#### inputSchema.properties.date.pattern

> **pattern**: `string` = '^\\d\{4\}-\\d\{2\}-\\d\{2\}$'

#### inputSchema.properties.date.type

> **type**: `string` = `'string'`

#### inputSchema.properties.includeIndividualVotes

> **includeIndividualVotes**: `object`

#### inputSchema.properties.includeIndividualVotes.default

> **default**: `boolean` = `true`

#### inputSchema.properties.includeIndividualVotes.description

> **description**: `string` = `'Include individual MEP vote positions from roll-call data (default: true). Set to false for aggregate-only results.'`

#### inputSchema.properties.includeIndividualVotes.type

> **type**: `string` = `'boolean'`

#### inputSchema.properties.limit

> **limit**: `object`

#### inputSchema.properties.limit.default

> **default**: `number` = `50`

#### inputSchema.properties.limit.description

> **description**: `string` = `'Maximum number of vote records to return (1-100)'`

#### inputSchema.properties.limit.maximum

> **maximum**: `number` = `100`

#### inputSchema.properties.limit.minimum

> **minimum**: `number` = `1`

#### inputSchema.properties.limit.type

> **type**: `string` = `'number'`

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

#### inputSchema.properties.term

> **term**: `object`

#### inputSchema.properties.term.description

> **description**: `string` = `'Parliamentary term number (defaults to 10 for current 2024-2029 term)'`

#### inputSchema.properties.term.maximum

> **maximum**: `number` = `15`

#### inputSchema.properties.term.minimum

> **minimum**: `number` = `1`

#### inputSchema.properties.term.type

> **type**: `string` = `'number'`

#### inputSchema.properties.weekStart

> **weekStart**: `object`

#### inputSchema.properties.weekStart.description

> **description**: `string` = `'Monday of a specific plenary week (YYYY-MM-DD). Mutually exclusive with date. Fetches Mon-Thu of that week.'`

#### inputSchema.properties.weekStart.pattern

> **pattern**: `string` = '^\\d\{4\}-\\d\{2\}-\\d\{2\}$'

#### inputSchema.properties.weekStart.type

> **type**: `string` = `'string'`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'get_latest_votes'`
