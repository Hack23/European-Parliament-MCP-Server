[**European Parliament MCP Server API v1.2.17**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/mep](../README.md) / MEPDetailsSchema

# Variable: MEPDetailsSchema

> `const` **MEPDetailsSchema**: `ZodObject`\<\{ `active`: `ZodBoolean`; `address`: `ZodOptional`\<`ZodString`\>; `biography`: `ZodOptional`\<`ZodString`\>; `committees`: `ZodArray`\<`ZodString`\>; `country`: `ZodString`; `email`: `ZodOptional`\<`ZodEmail`\>; `facebook`: `ZodOptional`\<`ZodString`\>; `id`: `ZodString`; `name`: `ZodString`; `phone`: `ZodOptional`\<`ZodString`\>; `politicalGroup`: `ZodString`; `roles`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `termEnd`: `ZodOptional`\<`ZodString`\>; `termStart`: `ZodString`; `twitter`: `ZodOptional`\<`ZodString`\>; `votingStatistics`: `ZodOptional`\<`ZodObject`\<\{ `abstentions`: `ZodNumber`; `attendanceRate`: `ZodNumber`; `totalVotes`: `ZodNumber`; `votesAgainst`: `ZodNumber`; `votesFor`: `ZodNumber`; \}, `$strip`\>\>; `website`: `ZodOptional`\<`ZodURL`\>; \}, `$strip`\>

Defined in: [schemas/ep/mep.ts:79](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/mep.ts#L79)

MEP details output schema
