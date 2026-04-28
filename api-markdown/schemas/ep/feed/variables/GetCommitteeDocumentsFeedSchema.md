[**European Parliament MCP Server API v1.2.16**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/feed](../README.md) / GetCommitteeDocumentsFeedSchema

# Variable: GetCommitteeDocumentsFeedSchema

> `const` **GetCommitteeDocumentsFeedSchema**: `ZodObject`\<\{ `limit`: `ZodOptional`\<`ZodNumber`\>; `offset`: `ZodOptional`\<`ZodNumber`\>; `startDate`: `ZodOptional`\<`ZodString`\>; `timeframe`: `ZodOptional`\<`ZodDefault`\<`ZodEnum`\<\{ `custom`: `"custom"`; `one-day`: `"one-day"`; `one-month`: `"one-month"`; `one-week`: `"one-week"`; `today`: `"today"`; \}\>\>\>; \}, `$strip`\> = `FixedWindowFeedSchema`

Defined in: [schemas/ep/feed.ts:101](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/feed.ts#L101)

GET /committee-documents/feed — server-default window
