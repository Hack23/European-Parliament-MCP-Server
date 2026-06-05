[**European Parliament MCP Server API v1.3.15**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/earlyWarningSystem](../README.md) / handleEarlyWarningSystem

# Function: handleEarlyWarningSystem()

> **handleEarlyWarningSystem**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/earlyWarningSystem.ts:436](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/earlyWarningSystem.ts#L436)

MCP `CallTool` handler entry point for `early_warning_system`.

Validates the raw input arguments against
[EarlyWarningSystemSchema](../variables/EarlyWarningSystemSchema.md) and delegates execution to
[earlyWarningSystem](earlyWarningSystem.md).

## Parameters

### args

`unknown`

Raw, untrusted MCP `CallTool` arguments

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

The same [ToolResult](../../shared/types/interfaces/ToolResult.md) produced by
  [earlyWarningSystem](earlyWarningSystem.md)
