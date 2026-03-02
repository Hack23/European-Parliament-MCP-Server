[**European Parliament MCP Server API v1.1.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/errorHandler](../README.md) / handleToolError

# Function: handleToolError()

> **handleToolError**(`error`, `toolName`): [`ToolResult`](../../types/interfaces/ToolResult.md)

Defined in: [tools/shared/errorHandler.ts:23](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errorHandler.ts#L23)

Handle a caught tool error, returning a safe MCP error response.
Never exposes raw stack traces to MCP clients.

If the error is a [ToolError](../../errors/classes/ToolError.md), its own `toolName` and `isRetryable` are
used so the originating tool and retryability are correctly surfaced to callers
even when the error crosses handler boundaries.

## Parameters

### error

`unknown`

Caught error value

### toolName

`string`

Fallback tool name when error carries no tool identity

## Returns

[`ToolResult`](../../types/interfaces/ToolResult.md)

MCP-compliant ToolResult with isError flag set
