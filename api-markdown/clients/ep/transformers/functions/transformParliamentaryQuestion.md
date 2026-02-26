[**European Parliament MCP Server API v0.8.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/transformers](../README.md) / transformParliamentaryQuestion

# Function: transformParliamentaryQuestion()

> **transformParliamentaryQuestion**(`apiData`): [`ParliamentaryQuestion`](../../../../types/ep/question/interfaces/ParliamentaryQuestion.md)

Defined in: [clients/ep/transformers.ts:231](https://github.com/Hack23/European-Parliament-MCP-Server/blob/006b62840b740489118388cc87b431ee92a42c24/src/clients/ep/transformers.ts#L231)

Transforms EP API parliamentary question data to internal [ParliamentaryQuestion](../../../../types/ep/question/interfaces/ParliamentaryQuestion.md) format.

## Parameters

### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

## Returns

[`ParliamentaryQuestion`](../../../../types/ep/question/interfaces/ParliamentaryQuestion.md)
