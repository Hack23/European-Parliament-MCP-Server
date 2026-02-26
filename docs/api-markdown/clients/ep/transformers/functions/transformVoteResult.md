[**European Parliament MCP Server API v0.8.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/transformers](../README.md) / transformVoteResult

# Function: transformVoteResult()

> **transformVoteResult**(`apiData`, `sessionId`): [`VotingRecord`](../../../../types/ep/plenary/interfaces/VotingRecord.md)

Defined in: [clients/ep/transformers.ts:157](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/clients/ep/transformers.ts#L157)

Transforms EP API vote result data to internal [VotingRecord](../../../../types/ep/plenary/interfaces/VotingRecord.md) format.

## Parameters

### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

### sessionId

`string`

## Returns

[`VotingRecord`](../../../../types/ep/plenary/interfaces/VotingRecord.md)
