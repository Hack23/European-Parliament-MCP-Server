[**European Parliament MCP Server API v0.8.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/mep](../README.md) / MEPDetailsSchema

# Variable: MEPDetailsSchema

> `const` **MEPDetailsSchema**: `ZodObject`\<\{ `active`: `ZodBoolean`; `address`: `ZodOptional`\<`ZodString`\>; `biography`: `ZodOptional`\<`ZodString`\>; `committees`: `ZodArray`\<`ZodString`\>; `country`: `ZodString`; `email`: `ZodOptional`\<`ZodString`\>; `facebook`: `ZodOptional`\<`ZodString`\>; `id`: `ZodString`; `name`: `ZodString`; `phone`: `ZodOptional`\<`ZodString`\>; `politicalGroup`: `ZodString`; `roles`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `termEnd`: `ZodOptional`\<`ZodString`\>; `termStart`: `ZodString`; `twitter`: `ZodOptional`\<`ZodString`\>; `votingStatistics`: `ZodOptional`\<`ZodObject`\<\{ `abstentions`: `ZodNumber`; `attendanceRate`: `ZodNumber`; `totalVotes`: `ZodNumber`; `votesAgainst`: `ZodNumber`; `votesFor`: `ZodNumber`; \}, `$strip`\>\>; `website`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>

Defined in: [schemas/ep/mep.ts:82](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/schemas/ep/mep.ts#L82)

MEP details output schema
