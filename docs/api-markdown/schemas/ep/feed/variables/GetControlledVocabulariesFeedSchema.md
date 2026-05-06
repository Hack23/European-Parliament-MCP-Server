[**European Parliament MCP Server API v1.3.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/feed](../README.md) / GetControlledVocabulariesFeedSchema

# Variable: GetControlledVocabulariesFeedSchema

> `const` **GetControlledVocabulariesFeedSchema**: `ZodObject`\<\{ `limit`: `ZodOptional`\<`ZodNumber`\>; `offset`: `ZodOptional`\<`ZodNumber`\>; `startDate`: `ZodOptional`\<`ZodString`\>; `timeframe`: `ZodOptional`\<`ZodDefault`\<`ZodEnum`\<\{ `custom`: `"custom"`; `one-day`: `"one-day"`; `one-month`: `"one-month"`; `one-week`: `"one-week"`; `today`: `"today"`; \}\>\>\>; \}, `$strip`\> = `FixedWindowFeedSchema`

Defined in: [schemas/ep/feed.ts:113](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/feed.ts#L113)

GET /controlled-vocabularies/feed — server-default window
