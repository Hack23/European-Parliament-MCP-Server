[**European Parliament MCP Server API v1.2.18**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/activities](../README.md) / GetEventsSchema

# Variable: GetEventsSchema

> `const` **GetEventsSchema**: `ZodObject`\<\{ `eventId`: `ZodOptional`\<`ZodString`\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; \}, `$strip`\>

Defined in: [schemas/ep/activities.ts:103](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/activities.ts#L103)

Get events input schema.

**EP API /events filtering:** The EP API `/events` endpoint has no date
filtering at all — only pagination (limit/offset) is supported.
