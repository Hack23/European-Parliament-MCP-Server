[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/networkAnalysis](../README.md) / networkAnalysisToolMetadata

# Variable: networkAnalysisToolMetadata

> `const` **networkAnalysisToolMetadata**: `object`

Defined in: [tools/networkAnalysis.ts:447](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/networkAnalysis.ts#L447)

## Type Declaration

### description

> **description**: `string` = `'MEP relationship network mapping using committee co-membership. Computes centrality scores, cluster assignments, bridging MEPs, and network density metrics. Identifies informal power structures and cross-party collaboration pathways. NOTE: edges are derived from shared committee membership only; voting-similarity edges are reserved for a future version.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.analysisType

> **analysisType**: `object`

#### inputSchema.properties.analysisType.default

> **default**: `string` = `'combined'`

#### inputSchema.properties.analysisType.description

> **description**: `string` = `'Preferred analysis mode (currently edges are always committee co-membership; reserved for future use)'`

#### inputSchema.properties.analysisType.enum

> **enum**: `string`[]

#### inputSchema.properties.analysisType.type

> **type**: `string` = `'string'`

#### inputSchema.properties.depth

> **depth**: `object`

#### inputSchema.properties.depth.default

> **default**: `number` = `2`

#### inputSchema.properties.depth.description

> **description**: `string` = `'Network traversal depth (1-3, default 2; reserved for future traversal-by-depth support)'`

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

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'network_analysis'`
