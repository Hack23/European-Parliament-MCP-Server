[**European Parliament MCP Server API v0.8.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/plenary](../README.md) / VotingRecordSchema

# Variable: VotingRecordSchema

> `const` **VotingRecordSchema**: `ZodObject`\<\{ `abstentions`: `ZodNumber`; `date`: `ZodString`; `id`: `ZodString`; `mepVotes`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodEnum`\<\{ `ABSTAIN`: `"ABSTAIN"`; `AGAINST`: `"AGAINST"`; `FOR`: `"FOR"`; \}\>\>\>; `result`: `ZodEnum`\<\{ `ADOPTED`: `"ADOPTED"`; `REJECTED`: `"REJECTED"`; \}\>; `sessionId`: `ZodString`; `topic`: `ZodString`; `votesAgainst`: `ZodNumber`; `votesFor`: `ZodNumber`; \}, `$strip`\>

Defined in: [schemas/ep/plenary.ts:89](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/schemas/ep/plenary.ts#L89)

Voting record output schema
