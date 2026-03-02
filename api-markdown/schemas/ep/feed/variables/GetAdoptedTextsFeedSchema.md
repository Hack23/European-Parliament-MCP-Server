[**European Parliament MCP Server API v1.1.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/feed](../README.md) / GetAdoptedTextsFeedSchema

# Variable: GetAdoptedTextsFeedSchema

> `const` **GetAdoptedTextsFeedSchema**: `ZodObject`\<\{ `startDate`: `ZodOptional`\<`ZodString`\>; `timeframe`: `ZodDefault`\<`ZodEnum`\<\{ `custom`: `"custom"`; `one-day`: `"one-day"`; `one-month`: `"one-month"`; `one-week`: `"one-week"`; `today`: `"today"`; \}\>\>; `workType`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>

Defined in: [schemas/ep/feed.ts:87](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/feed.ts#L87)

GET /adopted-texts/feed
