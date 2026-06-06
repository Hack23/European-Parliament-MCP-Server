[**European Parliament MCP Server API v1.3.16**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/networkAnalysis](../README.md) / networkAnalysis

# Function: networkAnalysis()

> **networkAnalysis**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/networkAnalysis.ts:568](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/networkAnalysis.ts#L568)

Compute the MEP relationship network for the supplied parameters.

## Parameters

### params

#### analysisType

`"committee"` \| `"voting"` \| `"combined"` = `...`

#### depth

`number` = `...`

#### minSimilarity

`number` = `...`

#### mepId?

`number` = `...`

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>
