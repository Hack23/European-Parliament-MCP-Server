[**European Parliament MCP Server API v0.8.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/transformers](../README.md) / transformVoteResult

# Function: transformVoteResult()

> **transformVoteResult**(`apiData`, `sessionId`): [`VotingRecord`](../../../../types/ep/plenary/interfaces/VotingRecord.md)

Defined in: [clients/ep/transformers.ts:157](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/clients/ep/transformers.ts#L157)

Transforms EP API vote result data to internal [VotingRecord](../../../../types/ep/plenary/interfaces/VotingRecord.md) format.

## Parameters

### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

### sessionId

`string`

## Returns

[`VotingRecord`](../../../../types/ep/plenary/interfaces/VotingRecord.md)
