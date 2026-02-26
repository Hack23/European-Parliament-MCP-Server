[**European Parliament MCP Server API v0.8.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/errorHandler](../README.md) / handleDataUnavailable

# Function: handleDataUnavailable()

> **handleDataUnavailable**(`toolName`, `message`): [`ToolResult`](../../types/interfaces/ToolResult.md)

Defined in: [tools/shared/errorHandler.ts:33](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/tools/shared/errorHandler.ts#L33)

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
