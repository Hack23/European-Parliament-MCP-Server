[**European Parliament MCP Server API v0.7.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/mep](../README.md) / MEPDetailsSchema

# Variable: MEPDetailsSchema

> `const` **MEPDetailsSchema**: `ZodObject`\<\{ `active`: `ZodBoolean`; `address`: `ZodOptional`\<`ZodString`\>; `biography`: `ZodOptional`\<`ZodString`\>; `committees`: `ZodArray`\<`ZodString`\>; `country`: `ZodString`; `email`: `ZodOptional`\<`ZodString`\>; `facebook`: `ZodOptional`\<`ZodString`\>; `id`: `ZodString`; `name`: `ZodString`; `phone`: `ZodOptional`\<`ZodString`\>; `politicalGroup`: `ZodString`; `roles`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `termEnd`: `ZodOptional`\<`ZodString`\>; `termStart`: `ZodString`; `twitter`: `ZodOptional`\<`ZodString`\>; `votingStatistics`: `ZodOptional`\<`ZodObject`\<\{ `abstentions`: `ZodNumber`; `attendanceRate`: `ZodNumber`; `totalVotes`: `ZodNumber`; `votesAgainst`: `ZodNumber`; `votesFor`: `ZodNumber`; \}, `$strip`\>\>; `website`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>

Defined in: [schemas/ep/mep.ts:82](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/schemas/ep/mep.ts#L82)

MEP details output schema
