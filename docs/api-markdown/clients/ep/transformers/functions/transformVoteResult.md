[**European Parliament MCP Server API v0.7.3**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/transformers](../README.md) / transformVoteResult

# Function: transformVoteResult()

> **transformVoteResult**(`apiData`, `sessionId`): [`VotingRecord`](../../../../types/ep/plenary/interfaces/VotingRecord.md)

Defined in: [clients/ep/transformers.ts:157](https://github.com/Hack23/European-Parliament-MCP-Server/blob/c844f163befb571516b5718c5d197eff1e589dea/src/clients/ep/transformers.ts#L157)

Transforms EP API vote result data to internal [VotingRecord](../../../../types/ep/plenary/interfaces/VotingRecord.md) format.

## Parameters

### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

### sessionId

`string`

## Returns

[`VotingRecord`](../../../../types/ep/plenary/interfaces/VotingRecord.md)
