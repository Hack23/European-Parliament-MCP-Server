[**European Parliament MCP Server API v1.1.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/feed](../README.md) / GetDocumentsFeedSchema

# Variable: GetDocumentsFeedSchema

> `const` **GetDocumentsFeedSchema**: `ZodObject`\<\{ `startDate`: `ZodOptional`\<`ZodString`\>; `timeframe`: `ZodDefault`\<`ZodEnum`\<\{ `custom`: `"custom"`; `one-day`: `"one-day"`; `one-month`: `"one-month"`; `one-week`: `"one-week"`; `today`: `"today"`; \}\>\>; \}, `$strip`\> = `BaseFeedParamsSchema`

Defined in: [schemas/ep/feed.ts:61](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/feed.ts#L61)

GET /documents/feed
