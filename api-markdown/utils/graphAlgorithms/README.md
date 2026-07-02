[**European Parliament MCP Server API v1.3.34**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / utils/graphAlgorithms

# utils/graphAlgorithms

## Fileoverview

Graph algorithms for MEP relationship-network OSINT.

Pure, deterministic helpers consumed by `network_analysis`:
- [buildAdjacency](functions/buildAdjacency.md) — adjacency map from a weighted edge list.
- [bfsLimited](functions/bfsLimited.md) — depth-bounded BFS ego-network extraction.
- [weightedDegree](functions/weightedDegree.md) — weighted-degree centrality per node.
- [betweennessCentrality](functions/betweennessCentrality.md) — Brandes' algorithm (weighted, Dijkstra-based, O(V²·log V) with the current array-backed priority queue).
- [labelPropagation](functions/labelPropagation.md) — deterministic asynchronous label-propagation community detection.
- [modularity](functions/modularity.md) — Newman's modularity Q for a partition.

Algorithms are deterministic — every iteration orders nodes/edges by string
comparison so identical input always produces identical output, satisfying
the OSINT reproducibility requirement.

ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege).

## Since

1.4.0

## Interfaces

- [WeightedEdge](interfaces/WeightedEdge.md)

## Type Aliases

- [AdjacencyMap](type-aliases/AdjacencyMap.md)

## Functions

- [betweennessCentrality](functions/betweennessCentrality.md)
- [bfsLimited](functions/bfsLimited.md)
- [buildAdjacency](functions/buildAdjacency.md)
- [labelPropagation](functions/labelPropagation.md)
- [modularity](functions/modularity.md)
- [weightedDegree](functions/weightedDegree.md)
