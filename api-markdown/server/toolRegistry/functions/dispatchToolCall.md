[**European Parliament MCP Server API v0.8.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [server/toolRegistry](../README.md) / dispatchToolCall

# Function: dispatchToolCall()

> **dispatchToolCall**(`name`, `args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../types/interfaces/ToolResult.md)\>

Defined in: [server/toolRegistry.ts:198](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/server/toolRegistry.ts#L198)

Dispatches a tool call to the registered handler.

## Parameters

### name

`string`

Tool name from the MCP `CallTool` request

### args

`unknown`

Validated tool arguments

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../types/interfaces/ToolResult.md)\>

Tool execution result

## Throws

If the tool name is not recognized
