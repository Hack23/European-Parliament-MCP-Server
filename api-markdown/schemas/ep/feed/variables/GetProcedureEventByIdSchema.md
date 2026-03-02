[**European Parliament MCP Server API v1.1.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/feed](../README.md) / GetProcedureEventByIdSchema

# Variable: GetProcedureEventByIdSchema

> `const` **GetProcedureEventByIdSchema**: `ZodObject`\<\{ `eventId`: `ZodString`; `processId`: `ZodString`; \}, `$strip`\>

Defined in: [schemas/ep/feed.ts:107](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/feed.ts#L107)

GET /procedures/{process-id}/events/{event-id}
