[**European Parliament MCP Server API v1.3.34**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/graphAlgorithms](../README.md) / modularity

# Function: modularity()

> **modularity**(`nodeIds`, `edges`, `labels`): `number`

Defined in: [utils/graphAlgorithms.ts:411](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/graphAlgorithms.ts#L411)

Newman's modularity Q for a weighted partition.

`Q = (1 / 2m) Σ_{ij} [A_ij - k_i k_j / 2m] δ(c_i, c_j)`

where `A_ij` is edge weight, `k_i` weighted degree, and `δ` the Kronecker
indicator for same-community. Q ∈ `[-0.5, 1]`; values >0.3 indicate
meaningful community structure.

## Parameters

### nodeIds

readonly `string`[]

Node universe.

### edges

readonly [`WeightedEdge`](../interfaces/WeightedEdge.md)[]

Weighted edges.

### labels

[`Map`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, `string`\>

Community label per node (from [labelPropagation](labelPropagation.md)).

## Returns

`number`

Modularity Q rounded to 4 decimal places (`0` when the graph is empty).
