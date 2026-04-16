[**European Parliament MCP Server API v1.2.8**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/responseBuilder](../README.md) / buildErrorResponse

# Function: buildErrorResponse()

> **buildErrorResponse**(`error`, `toolName`, `classification?`): [`ToolResult`](../../types/interfaces/ToolResult.md)

Defined in: [tools/shared/responseBuilder.ts:37](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/responseBuilder.ts#L37)

Build an error response from an error value or message string.
Never exposes raw stack traces to MCP clients.

When no explicit classification is provided, the error is automatically
classified via [classifyError](../../errorClassifier/functions/classifyError.md) so all error responses — whether
routed through `handleToolError` or built directly by tool handlers —
include consistent `errorCode`, `errorCategory`, and `retryable` metadata.

## Parameters

### error

`unknown`

Error instance or message string

### toolName

`string`

Name of the tool that produced the error

### classification?

[`ErrorClassification`](../../errorClassifier/interfaces/ErrorClassification.md)

Optional pre-computed classification (auto-classified if omitted)

## Returns

[`ToolResult`](../../types/interfaces/ToolResult.md)

MCP-compliant ToolResult with isError flag set
