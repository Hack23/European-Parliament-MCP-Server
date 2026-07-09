[**European Parliament MCP Server API v1.3.41**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [server/types](../README.md) / ToolMetadata

# Interface: ToolMetadata

Defined in: [server/types.ts:46](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/types.ts#L46)

Full metadata descriptor for a registered MCP tool.

Extends the minimal MCP schema with a `category` field so callers
can group, filter, or display tools by logical purpose.

## Properties

### category

> **category**: [`ToolCategory`](../type-aliases/ToolCategory.md)

Defined in: [server/types.ts:54](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/types.ts#L54)

Logical category for grouping and display

***

### description

> **description**: `string`

Defined in: [server/types.ts:50](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/types.ts#L50)

Human-readable description shown in `ListTools` responses

***

### inputSchema

> **inputSchema**: `unknown`

Defined in: [server/types.ts:52](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/types.ts#L52)

JSON-Schema object describing the tool's input parameters

***

### name

> **name**: `string`

Defined in: [server/types.ts:48](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/types.ts#L48)

Unique tool identifier used in MCP `CallTool` requests
