[**European Parliament MCP Server API v1.3.12**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/comparativeIntelligence](../README.md) / handleComparativeIntelligence

# Function: handleComparativeIntelligence()

> **handleComparativeIntelligence**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/comparativeIntelligence.ts:920](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/comparativeIntelligence.ts#L920)

MCP `CallTool` handler entry point for `comparative_intelligence`.

Validates the raw input arguments against
[ComparativeIntelligenceSchema](../variables/ComparativeIntelligenceSchema.md) and delegates execution to
[comparativeIntelligence](comparativeIntelligence.md).

## Parameters

### args

`unknown`

Raw, untrusted MCP `CallTool` arguments

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

The same [ToolResult](../../shared/types/interfaces/ToolResult.md) produced by
  [comparativeIntelligence](comparativeIntelligence.md)
