[**European Parliament MCP Server API v1.3.20**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/graphAlgorithms](../README.md) / buildAdjacency

# Function: buildAdjacency()

> **buildAdjacency**(`nodeIds`, `edges`): [`AdjacencyMap`](../type-aliases/AdjacencyMap.md)

Defined in: [utils/graphAlgorithms.ts:46](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/graphAlgorithms.ts#L46)

Build an undirected adjacency map from a weighted edge list.

Self-loops are dropped. Parallel edges between the same pair are merged
by taking the **maximum** weight (so combined networks remain
well-defined when both committee and voting edges describe the same pair).

## Parameters

### nodeIds

readonly `string`[]

Full node universe; nodes without edges still appear as empty maps.

### edges

readonly [`WeightedEdge`](../interfaces/WeightedEdge.md)[]

Weighted edges (order-independent).

## Returns

[`AdjacencyMap`](../type-aliases/AdjacencyMap.md)

Adjacency map keyed by node id.
