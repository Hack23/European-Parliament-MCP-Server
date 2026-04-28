[**European Parliament MCP Server API v1.2.16**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getServerHealth](../README.md) / handleGetServerHealth

# Function: handleGetServerHealth()

> **handleGetServerHealth**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getServerHealth.ts:101](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getServerHealth.ts#L101)

Handles the get_server_health MCP tool request.

Returns a structured health snapshot including:
- Server version, uptime, and overall status
- Per-feed health status (ok / error / unknown)
- Aggregate availability level (Full / Degraded / Sparse / Unavailable)

## Parameters

### args

`unknown`

Validated against empty-object schema (no parameters accepted)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result with JSON health payload
