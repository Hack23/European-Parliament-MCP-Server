[**European Parliament MCP Server API v1.3.22**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/earlyWarningSystem](../README.md) / earlyWarningSystem

# Function: earlyWarningSystem()

> **earlyWarningSystem**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/earlyWarningSystem.ts:323](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/earlyWarningSystem.ts#L323)

Compute an early-warning assessment of EP political stability.

Implementation of the MCP `early_warning_system` tool. Analyses current
group composition for fragmentation, dominant-group risks, minority
quorum risks and coalition viability, derives severity-tagged warnings,
and produces an overall stability score (0-100) and risk level.

## Parameters

### params

Validated tool parameters
  (see [EarlyWarningSystemSchema](../variables/EarlyWarningSystemSchema.md))

#### focusArea

`"attendance"` \| `"all"` \| `"coalitions"` = `...`

#### sensitivity

`"low"` \| `"medium"` \| `"high"` = `...`

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

A [ToolResult](../../shared/types/interfaces/ToolResult.md) containing the warning report or a
  structured error response on failure
