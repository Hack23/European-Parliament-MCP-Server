[**European Parliament MCP Server API v1.2.9**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/feed](../README.md) / GetProcedureEventByIdSchema

# Variable: GetProcedureEventByIdSchema

> `const` **GetProcedureEventByIdSchema**: `ZodObject`\<\{ `eventId`: `ZodString`; `processId`: `ZodString`; \}, `$strip`\>

Defined in: [schemas/ep/feed.ts:127](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/feed.ts#L127)

GET /procedures/{process-id}/events/{event-id}
