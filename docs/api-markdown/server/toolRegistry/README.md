[**European Parliament MCP Server API v0.8.0**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / server/toolRegistry

# server/toolRegistry

MCP tool registry – metadata and dispatch.

Centralizes the mapping between tool names, their metadata (name,
description, inputSchema) and the handler functions that execute
tool calls. The [getToolMetadataArray](functions/getToolMetadataArray.md) function feeds the
MCP `ListTools` response, while [dispatchToolCall](functions/dispatchToolCall.md) routes
incoming `CallTool` requests to the correct handler.

## Functions

- [dispatchToolCall](functions/dispatchToolCall.md)
- [getToolMetadataArray](functions/getToolMetadataArray.md)

## References

### CLIOptions

Re-exports [CLIOptions](../types/interfaces/CLIOptions.md)

***

### ToolCategory

Re-exports [ToolCategory](../types/type-aliases/ToolCategory.md)

***

### ToolHandler

Re-exports [ToolHandler](../types/type-aliases/ToolHandler.md)

***

### ToolMetadata

Re-exports [ToolMetadata](../types/interfaces/ToolMetadata.md)

***

### ToolResult

Re-exports [ToolResult](../types/interfaces/ToolResult.md)
