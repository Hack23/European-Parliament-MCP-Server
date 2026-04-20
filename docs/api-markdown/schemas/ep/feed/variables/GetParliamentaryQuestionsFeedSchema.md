[**European Parliament MCP Server API v1.2.10**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/feed](../README.md) / GetParliamentaryQuestionsFeedSchema

# Variable: GetParliamentaryQuestionsFeedSchema

> `const` **GetParliamentaryQuestionsFeedSchema**: `ZodObject`\<\{ `limit`: `ZodOptional`\<`ZodNumber`\>; `offset`: `ZodOptional`\<`ZodNumber`\>; `startDate`: `ZodOptional`\<`ZodString`\>; `timeframe`: `ZodOptional`\<`ZodDefault`\<`ZodEnum`\<\{ `custom`: `"custom"`; `one-day`: `"one-day"`; `one-month`: `"one-month"`; `one-week`: `"one-week"`; `today`: `"today"`; \}\>\>\>; \}, `$strip`\> = `FixedWindowFeedSchema`

Defined in: [schemas/ep/feed.ts:107](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/feed.ts#L107)

GET /parliamentary-questions/feed — server-default window
