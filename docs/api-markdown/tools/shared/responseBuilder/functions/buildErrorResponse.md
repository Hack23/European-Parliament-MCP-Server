[**European Parliament MCP Server API v0.8.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/responseBuilder](../README.md) / buildErrorResponse

# Function: buildErrorResponse()

> **buildErrorResponse**(`error`, `toolName`): [`ToolResult`](../../types/interfaces/ToolResult.md)

Defined in: [tools/shared/responseBuilder.ts:29](https://github.com/Hack23/European-Parliament-MCP-Server/blob/006b62840b740489118388cc87b431ee92a42c24/src/tools/shared/responseBuilder.ts#L29)

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
