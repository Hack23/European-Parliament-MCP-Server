[**European Parliament MCP Server API v0.8.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [server/types](../README.md) / ToolHandler

# Type Alias: ToolHandler()

> **ToolHandler** = (`args`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../interfaces/ToolResult.md)\>

Defined in: [server/types.ts:27](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/server/types.ts#L27)

Typed handler function for an MCP tool call.

## Parameters

### args

`unknown`

Raw (unvalidated) tool arguments from the MCP request

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../interfaces/ToolResult.md)\>

Promise resolving to the tool execution result
