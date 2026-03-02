[**European Parliament MCP Server API v1.1.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/feed](../README.md) / GetProceduresFeedSchema

# Variable: GetProceduresFeedSchema

> `const` **GetProceduresFeedSchema**: `ZodObject`\<\{ `processType`: `ZodOptional`\<`ZodString`\>; `startDate`: `ZodOptional`\<`ZodString`\>; `timeframe`: `ZodDefault`\<`ZodEnum`\<\{ `custom`: `"custom"`; `one-day`: `"one-day"`; `one-month`: `"one-month"`; `one-week`: `"one-week"`; `today`: `"today"`; \}\>\>; \}, `$strip`\>

Defined in: [schemas/ep/feed.ts:81](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/feed.ts#L81)

GET /procedures/feed
