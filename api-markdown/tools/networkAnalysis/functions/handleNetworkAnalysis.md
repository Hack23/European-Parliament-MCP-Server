[**European Parliament MCP Server API v1.3.6**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/networkAnalysis](../README.md) / handleNetworkAnalysis

# Function: handleNetworkAnalysis()

> **handleNetworkAnalysis**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/networkAnalysis.ts:513](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/networkAnalysis.ts#L513)

MCP `CallTool` handler entry point for `network_analysis`.

Validates the raw input arguments against [NetworkAnalysisSchema](../variables/NetworkAnalysisSchema.md)
and delegates execution to [networkAnalysis](networkAnalysis.md). Schema validation
errors propagate as Zod errors and are formatted by the registry.

## Parameters

### args

`unknown`

Raw, untrusted MCP `CallTool` arguments

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

The same [ToolResult](../../shared/types/interfaces/ToolResult.md) produced by [networkAnalysis](networkAnalysis.md)
