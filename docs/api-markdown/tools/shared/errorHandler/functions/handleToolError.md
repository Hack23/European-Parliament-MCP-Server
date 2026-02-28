[**European Parliament MCP Server API v0.9.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/errorHandler](../README.md) / handleToolError

# Function: handleToolError()

> **handleToolError**(`error`, `toolName`): [`ToolResult`](../../types/interfaces/ToolResult.md)

Defined in: [tools/shared/errorHandler.ts:18](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errorHandler.ts#L18)

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
