[**European Parliament MCP Server API v1.3.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getLatestVotes](../README.md) / GetLatestVotesSchema

# Variable: GetLatestVotesSchema

> `const` **GetLatestVotesSchema**: `ZodObject`\<\{ `date`: `ZodOptional`\<`ZodString`\>; `includeIndividualVotes`: `ZodDefault`\<`ZodOptional`\<`ZodBoolean`\>\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `term`: `ZodOptional`\<`ZodNumber`\>; `weekStart`: `ZodOptional`\<`ZodString`\>; \}, `$strict`\>

Defined in: [tools/getLatestVotes.ts:42](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getLatestVotes.ts#L42)

Input schema for get_latest_votes tool.
