[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getExternalDocumentsFeed](../README.md) / handleGetExternalDocumentsFeed

# Function: handleGetExternalDocumentsFeed()

> **handleGetExternalDocumentsFeed**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getExternalDocumentsFeed.ts:24](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getExternalDocumentsFeed.ts#L24)

Handles the get_external_documents_feed MCP tool request.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetExternalDocumentsFeedSchema](../../../schemas/ep/feed/variables/GetExternalDocumentsFeedSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing recently updated external document data

## Security

Input is validated with Zod before any API call.
