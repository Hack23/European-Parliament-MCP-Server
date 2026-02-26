[**European Parliament MCP Server API v0.8.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/plenary](../README.md) / GetVotingRecordsSchema

# Variable: GetVotingRecordsSchema

> `const` **GetVotingRecordsSchema**: `ZodObject`\<\{ `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `mepId`: `ZodOptional`\<`ZodString`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `sessionId`: `ZodOptional`\<`ZodString`\>; `topic`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>

Defined in: [schemas/ep/plenary.ts:55](https://github.com/Hack23/European-Parliament-MCP-Server/blob/006b62840b740489118388cc87b431ee92a42c24/src/schemas/ep/plenary.ts#L55)

Get voting records input schema
