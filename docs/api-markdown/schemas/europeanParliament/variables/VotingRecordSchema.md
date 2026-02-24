[**European Parliament MCP Server API v0.6.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [schemas/europeanParliament](../README.md) / VotingRecordSchema

# Variable: VotingRecordSchema

> `const` **VotingRecordSchema**: `ZodObject`\<\{ `abstentions`: `ZodNumber`; `date`: `ZodString`; `id`: `ZodString`; `mepVotes`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodEnum`\<\{ `ABSTAIN`: `"ABSTAIN"`; `AGAINST`: `"AGAINST"`; `FOR`: `"FOR"`; \}\>\>\>; `result`: `ZodEnum`\<\{ `ADOPTED`: `"ADOPTED"`; `REJECTED`: `"REJECTED"`; \}\>; `sessionId`: `ZodString`; `topic`: `ZodString`; `votesAgainst`: `ZodNumber`; `votesFor`: `ZodNumber`; \}, `$strip`\>

Defined in: [schemas/europeanParliament.ts:196](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/schemas/europeanParliament.ts#L196)

Voting record output schema
