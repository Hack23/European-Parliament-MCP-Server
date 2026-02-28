[**European Parliament MCP Server API v0.9.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/activities](../README.md) / GetMeetingPlenarySessionDocumentsSchema

# Variable: GetMeetingPlenarySessionDocumentsSchema

> `const` **GetMeetingPlenarySessionDocumentsSchema**: `ZodObject`\<\{ `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `sittingId`: `ZodString`; \}, `$strip`\>

Defined in: [schemas/ep/activities.ts:259](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/activities.ts#L259)

Get meeting plenary session documents input schema
Maps to `GET /meetings/{sitting-id}/plenary-session-documents`
