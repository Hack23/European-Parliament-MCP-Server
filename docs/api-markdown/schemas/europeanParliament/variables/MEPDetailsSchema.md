[**European Parliament MCP Server API v0.7.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [schemas/europeanParliament](../README.md) / MEPDetailsSchema

# Variable: MEPDetailsSchema

> `const` **MEPDetailsSchema**: `ZodObject`\<\{ `active`: `ZodBoolean`; `address`: `ZodOptional`\<`ZodString`\>; `biography`: `ZodOptional`\<`ZodString`\>; `committees`: `ZodArray`\<`ZodString`\>; `country`: `ZodString`; `email`: `ZodOptional`\<`ZodString`\>; `facebook`: `ZodOptional`\<`ZodString`\>; `id`: `ZodString`; `name`: `ZodString`; `phone`: `ZodOptional`\<`ZodString`\>; `politicalGroup`: `ZodString`; `roles`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `termEnd`: `ZodOptional`\<`ZodString`\>; `termStart`: `ZodString`; `twitter`: `ZodOptional`\<`ZodString`\>; `votingStatistics`: `ZodOptional`\<`ZodObject`\<\{ `abstentions`: `ZodNumber`; `attendanceRate`: `ZodNumber`; `totalVotes`: `ZodNumber`; `votesAgainst`: `ZodNumber`; `votesFor`: `ZodNumber`; \}, `$strip`\>\>; `website`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>

Defined in: [schemas/europeanParliament.ts:105](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/schemas/europeanParliament.ts#L105)

MEP details output schema
