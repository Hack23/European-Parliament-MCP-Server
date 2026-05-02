[**European Parliament MCP Server API v1.2.20**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/activities](../README.md) / GetMeetingForeseenActivitiesSchema

# Variable: GetMeetingForeseenActivitiesSchema

> `const` **GetMeetingForeseenActivitiesSchema**: `ZodObject`\<\{ `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `sittingId`: `ZodString`; \}, `$strip`\>

Defined in: [schemas/ep/activities.ts:221](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/activities.ts#L221)

Get meeting foreseen activities input schema.
Note: The EP API foreseen-activities endpoint can be slow for large meetings;
a lower default limit (20) reduces response time.
