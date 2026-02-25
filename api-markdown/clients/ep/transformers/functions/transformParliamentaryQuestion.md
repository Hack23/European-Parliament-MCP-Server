[**European Parliament MCP Server API v0.7.3**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/transformers](../README.md) / transformParliamentaryQuestion

# Function: transformParliamentaryQuestion()

> **transformParliamentaryQuestion**(`apiData`): [`ParliamentaryQuestion`](../../../../types/ep/question/interfaces/ParliamentaryQuestion.md)

Defined in: [clients/ep/transformers.ts:231](https://github.com/Hack23/European-Parliament-MCP-Server/blob/c844f163befb571516b5718c5d197eff1e589dea/src/clients/ep/transformers.ts#L231)

Transforms EP API parliamentary question data to internal [ParliamentaryQuestion](../../../../types/ep/question/interfaces/ParliamentaryQuestion.md) format.

## Parameters

### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

## Returns

[`ParliamentaryQuestion`](../../../../types/ep/question/interfaces/ParliamentaryQuestion.md)
