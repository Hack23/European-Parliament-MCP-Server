[**European Parliament MCP Server API v1.0.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [server/types](../README.md) / ToolMetadata

# Interface: ToolMetadata

Defined in: [server/types.ts:51](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/types.ts#L51)

Full metadata descriptor for a registered MCP tool.

Extends the minimal MCP schema with a `category` field so callers
can group, filter, or display tools by logical purpose.

## Properties

### category

> **category**: [`ToolCategory`](../type-aliases/ToolCategory.md)

Defined in: [server/types.ts:59](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/types.ts#L59)

Logical category for grouping and display

***

### description

> **description**: `string`

Defined in: [server/types.ts:55](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/types.ts#L55)

Human-readable description shown in `ListTools` responses

***

### inputSchema

> **inputSchema**: `unknown`

Defined in: [server/types.ts:57](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/types.ts#L57)

JSON-Schema object describing the tool's input parameters

***

### name

> **name**: `string`

Defined in: [server/types.ts:53](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/types.ts#L53)

Unique tool identifier used in MCP `CallTool` requests
