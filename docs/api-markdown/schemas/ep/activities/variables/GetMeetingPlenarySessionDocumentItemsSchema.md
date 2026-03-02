[**European Parliament MCP Server API v1.1.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/activities](../README.md) / GetMeetingPlenarySessionDocumentItemsSchema

# Variable: GetMeetingPlenarySessionDocumentItemsSchema

> `const` **GetMeetingPlenarySessionDocumentItemsSchema**: `ZodObject`\<\{ `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `sittingId`: `ZodString`; \}, `$strip`\>

Defined in: [schemas/ep/activities.ts:293](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/activities.ts#L293)

Get meeting plenary session document items input schema
Maps to `GET /meetings/{sitting-id}/plenary-session-document-items`
