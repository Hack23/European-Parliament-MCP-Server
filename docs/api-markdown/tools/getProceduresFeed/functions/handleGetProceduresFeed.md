[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getProceduresFeed](../README.md) / handleGetProceduresFeed

# Function: handleGetProceduresFeed()

> **handleGetProceduresFeed**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getProceduresFeed.ts:24](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getProceduresFeed.ts#L24)

Handles the get_procedures_feed MCP tool request.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetProceduresFeedSchema](../../../schemas/ep/feed/variables/GetProceduresFeedSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing recently updated procedure data

## Security

Input is validated with Zod before any API call.
