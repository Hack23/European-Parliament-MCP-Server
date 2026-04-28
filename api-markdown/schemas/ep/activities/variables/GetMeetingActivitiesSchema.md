[**European Parliament MCP Server API v1.2.16**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/activities](../README.md) / GetMeetingActivitiesSchema

# Variable: GetMeetingActivitiesSchema

> `const` **GetMeetingActivitiesSchema**: `ZodObject`\<\{ `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `sittingId`: `ZodString`; \}, `$strip`\>

Defined in: [schemas/ep/activities.ts:127](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/activities.ts#L127)

Get meeting activities input schema.
Note: The EP API activities endpoint can be slow for large meetings;
a lower default limit (20) reduces response time.
