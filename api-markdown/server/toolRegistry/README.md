[**European Parliament MCP Server API v0.7.3**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / server/toolRegistry

# server/toolRegistry

MCP tool registry – metadata and dispatch.

Centralizes the mapping between tool names, their metadata (name,
description, inputSchema) and the handler functions that execute
tool calls. The [getToolMetadataArray](functions/getToolMetadataArray.md) function feeds the
MCP `ListTools` response, while [dispatchToolCall](functions/dispatchToolCall.md) routes
incoming `CallTool` requests to the correct handler.

## Interfaces

- [ToolResult](interfaces/ToolResult.md)

## Functions

- [dispatchToolCall](functions/dispatchToolCall.md)
- [getToolMetadataArray](functions/getToolMetadataArray.md)
