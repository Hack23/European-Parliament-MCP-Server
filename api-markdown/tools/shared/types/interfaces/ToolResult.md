[**European Parliament MCP Server API v1.2.12**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/types](../README.md) / ToolResult

# Interface: ToolResult

Defined in: [tools/shared/types.ts:16](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/types.ts#L16)

Standard MCP tool result format

Every tool handler returns this structure, containing one or more content
blocks. Each block carries its MIME type and serialised payload.

## Properties

### content

> **content**: `object`[]

Defined in: [tools/shared/types.ts:17](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/types.ts#L17)

#### text

> **text**: `string`

#### type

> **type**: `"text"`

***

### isError?

> `optional` **isError?**: `boolean`

Defined in: [tools/shared/types.ts:18](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/types.ts#L18)
