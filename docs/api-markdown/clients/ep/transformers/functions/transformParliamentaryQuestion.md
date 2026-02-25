[**European Parliament MCP Server API v0.8.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/transformers](../README.md) / transformParliamentaryQuestion

# Function: transformParliamentaryQuestion()

> **transformParliamentaryQuestion**(`apiData`): [`ParliamentaryQuestion`](../../../../types/ep/question/interfaces/ParliamentaryQuestion.md)

Defined in: [clients/ep/transformers.ts:231](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/clients/ep/transformers.ts#L231)

Transforms EP API parliamentary question data to internal [ParliamentaryQuestion](../../../../types/ep/question/interfaces/ParliamentaryQuestion.md) format.

## Parameters

### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

## Returns

[`ParliamentaryQuestion`](../../../../types/ep/question/interfaces/ParliamentaryQuestion.md)
