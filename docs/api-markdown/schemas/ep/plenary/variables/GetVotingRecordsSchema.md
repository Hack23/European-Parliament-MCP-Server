[**European Parliament MCP Server API v1.2.21**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/plenary](../README.md) / GetVotingRecordsSchema

# Variable: GetVotingRecordsSchema

> `const` **GetVotingRecordsSchema**: `ZodObject`\<\{ `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `sessionId`: `ZodOptional`\<`ZodString`\>; `topic`: `ZodOptional`\<`ZodString`\>; \}, `$strict`\>

Defined in: [schemas/ep/plenary.ts:69](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/plenary.ts#L69)

Get voting records input schema.

Marked `.strict()` to reject unknown/removed parameters (e.g. the
deprecated `mepId` field, which was removed because the EP API does not
expose individual MEP votes). Clients passing such fields receive a
clear validation error instead of having them silently stripped.
