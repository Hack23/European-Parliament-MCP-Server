[**European Parliament MCP Server API v1.3.32**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/networkAnalysis](../README.md) / NetworkAnalysisSchema

# Variable: NetworkAnalysisSchema

> `const` **NetworkAnalysisSchema**: `ZodObject`\<[`NetworkAnalysisParams`](../type-aliases/NetworkAnalysisParams.md)\>

Defined in: [tools/networkAnalysis.ts:52](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/networkAnalysis.ts#L52)

Schema for network_analysis tool input.

The `analysisType` and `depth` parameters are fully implemented:
- `analysisType: 'committee'` builds weighted shared-committee edges.
- `analysisType: 'voting'` builds DOCEO RCV similarity edges (Jaccard-like).
- `analysisType: 'combined'` merges both with the mean of normalised weights.
- `depth` bounds the BFS ego-network when `mepId` is provided.
