[**European Parliament MCP Server API v1.2.18**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/errorHandler](../README.md) / extractToolName

# Function: extractToolName()

> **extractToolName**(`error`, `fallback`): `string`

Defined in: [tools/shared/errorHandler.ts:88](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errorHandler.ts#L88)

Extracts the nearest `toolName` from an error's cause chain.

Walks the chain from the provided error toward its causes, returning the
first `ToolError` encountered (that is, the outermost `ToolError` in the
chain). Falls back to the provided `fallback` when no `ToolError` is found.

## Parameters

### error

`unknown`

Root error to inspect

### fallback

`string`

Default tool name when no `ToolError` is in the chain

## Returns

`string`

The resolved tool name
