[**European Parliament MCP Server API v0.8.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/responseBuilder](../README.md) / buildErrorResponse

# Function: buildErrorResponse()

> **buildErrorResponse**(`error`, `toolName`): [`ToolResult`](../../types/interfaces/ToolResult.md)

Defined in: [tools/shared/responseBuilder.ts:29](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/tools/shared/responseBuilder.ts#L29)

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
