[**European Parliament MCP Server API v0.8.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [server/types](../README.md) / ToolMetadata

# Interface: ToolMetadata

Defined in: [server/types.ts:52](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/server/types.ts#L52)

Full metadata descriptor for a registered MCP tool.

Extends the minimal MCP schema with a `category` field so callers
can group, filter, or display tools by logical purpose.

## Properties

### category

> **category**: [`ToolCategory`](../type-aliases/ToolCategory.md)

Defined in: [server/types.ts:60](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/server/types.ts#L60)

Logical category for grouping and display

***

### description

> **description**: `string`

Defined in: [server/types.ts:56](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/server/types.ts#L56)

Human-readable description shown in `ListTools` responses

***

### inputSchema

> **inputSchema**: `unknown`

Defined in: [server/types.ts:58](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/server/types.ts#L58)

JSON-Schema object describing the tool's input parameters

***

### name

> **name**: `string`

Defined in: [server/types.ts:54](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/server/types.ts#L54)

Unique tool identifier used in MCP `CallTool` requests
