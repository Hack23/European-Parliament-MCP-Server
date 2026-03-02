[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getDocumentsFeed](../README.md) / handleGetDocumentsFeed

# Function: handleGetDocumentsFeed()

> **handleGetDocumentsFeed**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getDocumentsFeed.ts:24](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getDocumentsFeed.ts#L24)

Handles the get_documents_feed MCP tool request.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetDocumentsFeedSchema](../../../schemas/ep/feed/variables/GetDocumentsFeedSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing recently updated document data

## Security

Input is validated with Zod before any API call.
