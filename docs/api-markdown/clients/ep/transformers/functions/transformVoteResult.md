[**European Parliament MCP Server API v1.0.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/transformers](../README.md) / transformVoteResult

# Function: transformVoteResult()

> **transformVoteResult**(`apiData`, `sessionId`): [`VotingRecord`](../../../../types/ep/plenary/interfaces/VotingRecord.md)

Defined in: [clients/ep/transformers.ts:157](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/transformers.ts#L157)

Transforms EP API vote result data to internal [VotingRecord](../../../../types/ep/plenary/interfaces/VotingRecord.md) format.

## Parameters

### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

### sessionId

`string`

## Returns

[`VotingRecord`](../../../../types/ep/plenary/interfaces/VotingRecord.md)
