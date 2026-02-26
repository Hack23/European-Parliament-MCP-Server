[**European Parliament MCP Server API v0.8.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/errorHandler](../README.md) / handleDataUnavailable

# Function: handleDataUnavailable()

> **handleDataUnavailable**(`toolName`, `message`): [`ToolResult`](../../types/interfaces/ToolResult.md)

Defined in: [tools/shared/errorHandler.ts:33](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/tools/shared/errorHandler.ts#L33)

Build a structured data-unavailable response for tools that cannot
compute meaningful results due to missing upstream data.

## Parameters

### toolName

`string`

Name of the tool reporting unavailability

### message

`string`

Human-readable explanation of why data is unavailable

## Returns

[`ToolResult`](../../types/interfaces/ToolResult.md)

MCP-compliant ToolResult
