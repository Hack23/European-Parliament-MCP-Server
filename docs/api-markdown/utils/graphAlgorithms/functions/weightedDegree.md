[**European Parliament MCP Server API v1.3.35**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/graphAlgorithms](../README.md) / weightedDegree

# Function: weightedDegree()

> **weightedDegree**(`nodeIds`, `edges`): [`Map`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, `number`\>

Defined in: [utils/graphAlgorithms.ts:127](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/graphAlgorithms.ts#L127)

Weighted-degree centrality: sum of incident edge weights per node.

## Parameters

### nodeIds

readonly `string`[]

Node universe (so isolates return 0 rather than be omitted).

### edges

readonly [`WeightedEdge`](../interfaces/WeightedEdge.md)[]

Weighted edges.

## Returns

[`Map`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, `number`\>

Map from node id → summed incident weight.
