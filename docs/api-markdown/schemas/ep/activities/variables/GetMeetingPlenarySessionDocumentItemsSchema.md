[**European Parliament MCP Server API v1.0.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/activities](../README.md) / GetMeetingPlenarySessionDocumentItemsSchema

# Variable: GetMeetingPlenarySessionDocumentItemsSchema

> `const` **GetMeetingPlenarySessionDocumentItemsSchema**: `ZodObject`\<\{ `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `sittingId`: `ZodString`; \}, `$strip`\>

Defined in: [schemas/ep/activities.ts:281](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/activities.ts#L281)

Get meeting plenary session document items input schema
Maps to `GET /meetings/{sitting-id}/plenary-session-document-items`
