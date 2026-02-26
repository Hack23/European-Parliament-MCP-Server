[**European Parliament MCP Server API v0.8.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/plenary](../README.md) / VotingRecordSchema

# Variable: VotingRecordSchema

> `const` **VotingRecordSchema**: `ZodObject`\<\{ `abstentions`: `ZodNumber`; `date`: `ZodString`; `id`: `ZodString`; `mepVotes`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodEnum`\<\{ `ABSTAIN`: `"ABSTAIN"`; `AGAINST`: `"AGAINST"`; `FOR`: `"FOR"`; \}\>\>\>; `result`: `ZodEnum`\<\{ `ADOPTED`: `"ADOPTED"`; `REJECTED`: `"REJECTED"`; \}\>; `sessionId`: `ZodString`; `topic`: `ZodString`; `votesAgainst`: `ZodNumber`; `votesFor`: `ZodNumber`; \}, `$strip`\>

Defined in: [schemas/ep/plenary.ts:89](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/schemas/ep/plenary.ts#L89)

Voting record output schema
