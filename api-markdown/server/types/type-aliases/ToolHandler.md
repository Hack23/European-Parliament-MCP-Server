[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [server/types](../README.md) / ToolHandler

# Type Alias: ToolHandler()

> **ToolHandler** = (`args`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../../tools/shared/types/interfaces/ToolResult.md)\>

Defined in: [server/types.ts:26](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/types.ts#L26)

Typed handler function for an MCP tool call.

## Parameters

### args

`unknown`

Raw (unvalidated) tool arguments from the MCP request

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../../tools/shared/types/interfaces/ToolResult.md)\>

Promise resolving to the tool execution result
