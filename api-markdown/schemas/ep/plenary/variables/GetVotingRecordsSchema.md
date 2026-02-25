[**European Parliament MCP Server API v0.8.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/plenary](../README.md) / GetVotingRecordsSchema

# Variable: GetVotingRecordsSchema

> `const` **GetVotingRecordsSchema**: `ZodObject`\<\{ `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `mepId`: `ZodOptional`\<`ZodString`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `sessionId`: `ZodOptional`\<`ZodString`\>; `topic`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>

Defined in: [schemas/ep/plenary.ts:55](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/schemas/ep/plenary.ts#L55)

Get voting records input schema
