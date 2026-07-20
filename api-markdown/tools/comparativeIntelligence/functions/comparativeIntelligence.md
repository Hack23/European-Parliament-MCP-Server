[**European Parliament MCP Server API v1.4.3**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/comparativeIntelligence](../README.md) / comparativeIntelligence

# Function: comparativeIntelligence()

> **comparativeIntelligence**(`params`): `Promise`\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/comparativeIntelligence.ts:819](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/comparativeIntelligence.ts#L819)

Build a comparative-intelligence profile across 2-10 MEPs.

Implementation of the MCP `comparative_intelligence` tool. Fetches each
MEP's profile in parallel, builds per-dimension scores, computes
rankings and a cosine-similarity correlation matrix, detects outliers
(z-score ≥ 1.5) and groups MEPs into political-group + performance-tier
clusters.

## Parameters

### params

Validated tool parameters
  (see [ComparativeIntelligenceSchema](../variables/ComparativeIntelligenceSchema.md))

#### dimensions

(`"committee"` \| `"attendance"` \| `"voting"` \| `"legislative"`)[] = `...`

#### mepIds

`number`[] = `...`

## Returns

`Promise`\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

A [ToolResult](../../shared/types/interfaces/ToolResult.md) containing the comparative analysis or a
  structured error response on failure
