[**European Parliament MCP Server API v0.8.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/errorHandler](../README.md) / handleToolError

# Function: handleToolError()

> **handleToolError**(`error`, `toolName`): [`ToolResult`](../../types/interfaces/ToolResult.md)

Defined in: [tools/shared/errorHandler.ts:18](https://github.com/Hack23/European-Parliament-MCP-Server/blob/006b62840b740489118388cc87b431ee92a42c24/src/tools/shared/errorHandler.ts#L18)

Handle a caught tool error, returning a safe MCP error response.
Never exposes raw stack traces to MCP clients.

## Parameters

### error

`unknown`

Caught error value

### toolName

`string`

Name of the tool that produced the error

## Returns

[`ToolResult`](../../types/interfaces/ToolResult.md)

MCP-compliant ToolResult with isError flag set
