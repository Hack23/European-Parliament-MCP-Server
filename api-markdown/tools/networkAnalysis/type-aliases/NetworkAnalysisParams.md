[**European Parliament MCP Server API v1.3.8**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/networkAnalysis](../README.md) / NetworkAnalysisParams

# Type Alias: NetworkAnalysisParams

> **NetworkAnalysisParams** = `object`

Defined in: [tools/networkAnalysis.ts:56](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/networkAnalysis.ts#L56)

Inferred parameter type for the [NetworkAnalysisSchema](../variables/NetworkAnalysisSchema.md).

All fields default-fill to their schema-defined defaults, so the type
exposes already-validated, fully-defaulted parameters to downstream code.

## Type Declaration

### analysisType

> **analysisType**: `"committee"` \| `"voting"` \| `"combined"`

### depth

> **depth**: `number`

### mepId?

> `optional` **mepId?**: `number`
