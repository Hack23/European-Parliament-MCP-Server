[**European Parliament MCP Server API v1.2.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/activities](../README.md) / GetMeetingPlenarySessionDocumentItemsSchema

# Variable: GetMeetingPlenarySessionDocumentItemsSchema

> `const` **GetMeetingPlenarySessionDocumentItemsSchema**: `ZodObject`\<\{ `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `sittingId`: `ZodString`; \}, `$strip`\>

Defined in: [schemas/ep/activities.ts:299](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/activities.ts#L299)

Get meeting plenary session document items input schema.
Maps to `GET /meetings/{sitting-id}/plenary-session-document-items`
Note: This EP API endpoint can be slow; a lower default limit (20) reduces response time.
