[**European Parliament MCP Server API v0.8.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/errorHandler](../README.md) / handleDataUnavailable

# Function: handleDataUnavailable()

> **handleDataUnavailable**(`toolName`, `message`): [`ToolResult`](../../types/interfaces/ToolResult.md)

Defined in: [tools/shared/errorHandler.ts:33](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/tools/shared/errorHandler.ts#L33)

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
