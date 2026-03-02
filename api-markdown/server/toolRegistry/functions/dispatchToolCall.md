[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [server/toolRegistry](../README.md) / dispatchToolCall

# Function: dispatchToolCall()

> **dispatchToolCall**(`name`, `args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../../tools/shared/types/interfaces/ToolResult.md)\>

Defined in: [server/toolRegistry.ts:276](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/toolRegistry.ts#L276)

Dispatches a tool call to the registered handler.

## Parameters

### name

`string`

Tool name from the MCP `CallTool` request

### args

`unknown`

Validated tool arguments

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../../tools/shared/types/interfaces/ToolResult.md)\>

Tool execution result

## Throws

If the tool name is not recognized
