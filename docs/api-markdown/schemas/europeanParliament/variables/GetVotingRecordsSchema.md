[**European Parliament MCP Server API v0.7.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [schemas/europeanParliament](../README.md) / GetVotingRecordsSchema

# Variable: GetVotingRecordsSchema

> `const` **GetVotingRecordsSchema**: `ZodObject`\<\{ `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `mepId`: `ZodOptional`\<`ZodString`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `sessionId`: `ZodOptional`\<`ZodString`\>; `topic`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>

Defined in: [schemas/europeanParliament.ts:162](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/schemas/europeanParliament.ts#L162)

Get voting records input schema
