[**European Parliament MCP Server API v1.1.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/activities](../README.md) / GetEventsSchema

# Variable: GetEventsSchema

> `const` **GetEventsSchema**: `ZodObject`\<\{ `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `eventId`: `ZodOptional`\<`ZodString`\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `year`: `ZodOptional`\<`ZodNumber`\>; \}, `$strip`\>

Defined in: [schemas/ep/activities.ts:104](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/activities.ts#L104)

Get events input schema
