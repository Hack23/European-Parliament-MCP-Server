[**European Parliament MCP Server API v1.4.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/networkAnalysis](../README.md) / networkAnalysisToolMetadata

# Variable: networkAnalysisToolMetadata

> `const` **networkAnalysisToolMetadata**: `object`

Defined in: [tools/networkAnalysis.ts:666](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/networkAnalysis.ts#L666)

MCP tool metadata for `network_analysis`.

## Type Declaration

### description

> **description**: `string` = `'MEP relationship network mapping using committee co-membership and DOCEO roll-call vote similarity. Computes weighted-degree + Brandes betweenness centrality, deterministic label-propagation clusters with Newman modularity Q, and identifies cross-cluster brokers. Supports depth-bounded ego networks when mepId is supplied.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.analysisType

> **analysisType**: `object`

#### inputSchema.properties.analysisType.default

> **default**: `string` = `'combined'`

#### inputSchema.properties.analysisType.description

> **description**: `string` = `'Edge mode: committee, voting (DOCEO RCV), or combined (mean of both).'`

#### inputSchema.properties.analysisType.enum

> **enum**: `string`[]

#### inputSchema.properties.analysisType.type

> **type**: `string` = `'string'`

#### inputSchema.properties.depth

> **depth**: `object`

#### inputSchema.properties.depth.default

> **default**: `number` = `2`

#### inputSchema.properties.depth.description

> **description**: `string` = `'BFS traversal depth applied to the ego network when mepId is provided (1-3, default 2).'`

#### inputSchema.properties.depth.maximum

> **maximum**: `number` = `3`

#### inputSchema.properties.depth.minimum

> **minimum**: `number` = `1`

#### inputSchema.properties.depth.type

> **type**: `string` = `'number'`

#### inputSchema.properties.mepId

> **mepId**: `object`

#### inputSchema.properties.mepId.description

> **description**: `string` = `'Optional MEP ID to focus the network analysis (ego network)'`

#### inputSchema.properties.mepId.type

> **type**: `string` = `'number'`

#### inputSchema.properties.minSimilarity

> **minSimilarity**: `object`

#### inputSchema.properties.minSimilarity.default

> **default**: `number` = `0.7`

#### inputSchema.properties.minSimilarity.description

> **description**: `string` = `'Minimum DOCEO co-vote agreement to retain a voting-similarity edge (0-1, default 0.7).'`

#### inputSchema.properties.minSimilarity.maximum

> **maximum**: `number` = `1`

#### inputSchema.properties.minSimilarity.minimum

> **minimum**: `number` = `0`

#### inputSchema.properties.minSimilarity.type

> **type**: `string` = `'number'`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'network_analysis'`
