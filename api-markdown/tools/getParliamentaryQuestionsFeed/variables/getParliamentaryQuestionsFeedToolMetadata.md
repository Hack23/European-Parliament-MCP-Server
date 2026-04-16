[**European Parliament MCP Server API v1.2.8**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getParliamentaryQuestionsFeed](../README.md) / getParliamentaryQuestionsFeedToolMetadata

# Variable: getParliamentaryQuestionsFeedToolMetadata

> `const` **getParliamentaryQuestionsFeedToolMetadata**: `object`

Defined in: [tools/getParliamentaryQuestionsFeed.ts:68](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getParliamentaryQuestionsFeed.ts#L68)

Tool metadata for get_parliamentary_questions_feed

## Type Declaration

### description

> **description**: `string` = `'Get recently updated parliamentary questions from the EP Open Data Portal feed. This is a fixed-window feed — no parameters needed. Returns items updated within the server-defined default window (typically one month). Data source: European Parliament Open Data Portal.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object` = `{}`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'get_parliamentary_questions_feed'`
