[**European Parliament MCP Server API v1.3.40**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getExternalDocumentsFeed](../README.md) / handleGetExternalDocumentsFeed

# Function: handleGetExternalDocumentsFeed()

> **handleGetExternalDocumentsFeed**(`args`): `Promise`\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getExternalDocumentsFeed.ts:98](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getExternalDocumentsFeed.ts#L98)

Handles the get_external_documents_feed MCP tool request.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetExternalDocumentsFeedSchema](../../../schemas/ep/feed/variables/GetExternalDocumentsFeedSchema.md)

## Returns

`Promise`\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing recently updated external document data

## Security

Input is validated with Zod before any API call.
