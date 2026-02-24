[**European Parliament MCP Server API v0.7.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [schemas/europeanParliament](../README.md) / VotingRecordSchema

# Variable: VotingRecordSchema

> `const` **VotingRecordSchema**: `ZodObject`\<\{ `abstentions`: `ZodNumber`; `date`: `ZodString`; `id`: `ZodString`; `mepVotes`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodEnum`\<\{ `ABSTAIN`: `"ABSTAIN"`; `AGAINST`: `"AGAINST"`; `FOR`: `"FOR"`; \}\>\>\>; `result`: `ZodEnum`\<\{ `ADOPTED`: `"ADOPTED"`; `REJECTED`: `"REJECTED"`; \}\>; `sessionId`: `ZodString`; `topic`: `ZodString`; `votesAgainst`: `ZodNumber`; `votesFor`: `ZodNumber`; \}, `$strip`\>

Defined in: [schemas/europeanParliament.ts:196](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/schemas/europeanParliament.ts#L196)

Voting record output schema
