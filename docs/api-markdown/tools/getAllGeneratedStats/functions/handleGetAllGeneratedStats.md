[**European Parliament MCP Server API v1.3.23**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getAllGeneratedStats](../README.md) / handleGetAllGeneratedStats

# Function: handleGetAllGeneratedStats()

> **handleGetAllGeneratedStats**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getAllGeneratedStats.ts:479](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getAllGeneratedStats.ts#L479)

MCP `CallTool` handler entry point for `get_all_generated_stats`.

Validates the raw input arguments against
[GetAllGeneratedStatsSchema](../variables/GetAllGeneratedStatsSchema.md), raises a structured
[ToolError](../../shared/errors/classes/ToolError.md) on validation failure, and otherwise delegates to
the underlying generator.

## Parameters

### args

`unknown`

Raw, untrusted MCP `CallTool` arguments

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

A [ToolResult](../../shared/types/interfaces/ToolResult.md) with the generated statistics report

## Throws

ToolError when the schema validation fails
