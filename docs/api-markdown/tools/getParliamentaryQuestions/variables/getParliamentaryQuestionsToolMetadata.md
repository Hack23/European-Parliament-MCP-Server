[**European Parliament MCP Server API v0.9.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getParliamentaryQuestions](../README.md) / getParliamentaryQuestionsToolMetadata

# Variable: getParliamentaryQuestionsToolMetadata

> `const` **getParliamentaryQuestionsToolMetadata**: `object`

Defined in: [tools/getParliamentaryQuestions.ts:110](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getParliamentaryQuestions.ts#L110)

Tool metadata for MCP registration

## Type Declaration

### description

> **description**: `string` = `'Retrieve European Parliament questions (written and oral) submitted by MEPs, or a single question by docId. Filter by question type, author, topic, status (pending/answered), and date range. Returns question text, answers if available, and metadata.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.author

> **author**: `object`

#### inputSchema.properties.author.description

> **description**: `string` = `'MEP identifier or name of question author'`

#### inputSchema.properties.author.maxLength

> **maxLength**: `number` = `100`

#### inputSchema.properties.author.minLength

> **minLength**: `number` = `1`

#### inputSchema.properties.author.type

> **type**: `string` = `'string'`

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

#### inputSchema.properties.docId

> **docId**: `object`

#### inputSchema.properties.docId.description

> **description**: `string` = `'Document ID for single question lookup'`

#### inputSchema.properties.docId.type

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

#### inputSchema.properties.status

> **status**: `object`

#### inputSchema.properties.status.description

> **description**: `string` = `'Question status'`

#### inputSchema.properties.status.enum

> **enum**: `string`[]

#### inputSchema.properties.status.type

> **type**: `string` = `'string'`

#### inputSchema.properties.topic

> **topic**: `object`

#### inputSchema.properties.topic.description

> **description**: `string` = `'Question topic or keyword to search'`

#### inputSchema.properties.topic.maxLength

> **maxLength**: `number` = `200`

#### inputSchema.properties.topic.minLength

> **minLength**: `number` = `1`

#### inputSchema.properties.topic.type

> **type**: `string` = `'string'`

#### inputSchema.properties.type

> **type**: `object`

#### inputSchema.properties.type.description

> **description**: `string` = `'Question type'`

#### inputSchema.properties.type.enum

> **enum**: `string`[]

#### inputSchema.properties.type.type

> **type**: `string` = `'string'`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'get_parliamentary_questions'`
