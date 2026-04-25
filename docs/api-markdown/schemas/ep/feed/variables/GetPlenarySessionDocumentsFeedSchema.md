[**European Parliament MCP Server API v1.2.14**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/feed](../README.md) / GetPlenarySessionDocumentsFeedSchema

# Variable: GetPlenarySessionDocumentsFeedSchema

> `const` **GetPlenarySessionDocumentsFeedSchema**: `ZodObject`\<\{ `limit`: `ZodOptional`\<`ZodNumber`\>; `offset`: `ZodOptional`\<`ZodNumber`\>; `startDate`: `ZodOptional`\<`ZodString`\>; `timeframe`: `ZodOptional`\<`ZodDefault`\<`ZodEnum`\<\{ `custom`: `"custom"`; `one-day`: `"one-day"`; `one-month`: `"one-month"`; `one-week`: `"one-week"`; `today`: `"today"`; \}\>\>\>; \}, `$strip`\> = `FixedWindowFeedSchema`

Defined in: [schemas/ep/feed.ts:104](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/feed.ts#L104)

GET /plenary-session-documents/feed — server-default window
