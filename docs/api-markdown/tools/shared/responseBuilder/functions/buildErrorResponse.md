[**European Parliament MCP Server API v0.9.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/responseBuilder](../README.md) / buildErrorResponse

# Function: buildErrorResponse()

> **buildErrorResponse**(`error`, `toolName`): [`ToolResult`](../../types/interfaces/ToolResult.md)

Defined in: [tools/shared/responseBuilder.ts:29](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/responseBuilder.ts#L29)

Build an error response from an error value or message string.
Never exposes raw stack traces to MCP clients.

## Parameters

### error

`unknown`

Error instance or message string

### toolName

`string`

Name of the tool that produced the error

## Returns

[`ToolResult`](../../types/interfaces/ToolResult.md)

MCP-compliant ToolResult with isError flag set
