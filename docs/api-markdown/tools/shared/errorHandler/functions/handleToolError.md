[**European Parliament MCP Server API v1.2.8**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/errorHandler](../README.md) / handleToolError

# Function: handleToolError()

> **handleToolError**(`error`, `toolName`): [`ToolResult`](../../types/interfaces/ToolResult.md)

Defined in: [tools/shared/errorHandler.ts:175](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errorHandler.ts#L175)

Handle a caught tool error, returning a safe MCP error response.
Never exposes raw stack traces to MCP clients.

**Timeout handling:** When the root cause is a request timeout (status 408
or `TimeoutError`), returns a structured non-error response with
`data: []` and a `dataQualityWarnings` array instead of `isError: true`.
This prevents MCP clients from retrying the same slow request.

For non-timeout errors, the error is delegated to [buildErrorResponse](../../responseBuilder/functions/buildErrorResponse.md)
which auto-classifies via `classifyError()` and includes structured error
classification metadata (errorCode, errorCategory, httpStatus) enabling
programmatic retry logic. If the error is a [ToolError](../../errors/classes/ToolError.md), its own
`toolName` is preserved. Retryability is determined by auto-classification
(inspecting the cause chain) but can still honor `ToolError.isRetryable`
in generic fallback cases when no more specific signal is available.

## Parameters

### error

`unknown`

Caught error value

### toolName

`string`

Fallback tool name when error carries no tool identity

## Returns

[`ToolResult`](../../types/interfaces/ToolResult.md)

MCP-compliant ToolResult with isError flag set (or structured timeout response)
