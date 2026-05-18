[**European Parliament MCP Server API v1.3.8**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/networkAnalysis](../README.md) / networkAnalysis

# Function: networkAnalysis()

> **networkAnalysis**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/networkAnalysis.ts:403](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/networkAnalysis.ts#L403)

Compute the MEP committee co-membership network for the supplied parameters.

Implementation of the MCP `network_analysis` tool. Fetches the current MEP
roster (or the ego network around a focal MEP), builds undirected edges
from shared committee memberships, derives degree and centrality scores,
assigns political-bloc clusters, and identifies bridging MEPs that connect
different clusters.

## Parameters

### params

Validated tool parameters (see [NetworkAnalysisSchema](../variables/NetworkAnalysisSchema.md))

#### analysisType

`"committee"` \| `"voting"` \| `"combined"` = `...`

#### depth

`number` = `...`

#### mepId?

`number` = `...`

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

A [ToolResult](../../shared/types/interfaces/ToolResult.md) containing the network analysis or a
  structured error response on failure
