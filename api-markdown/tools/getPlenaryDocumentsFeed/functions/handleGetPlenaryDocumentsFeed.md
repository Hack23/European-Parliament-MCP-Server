[**European Parliament MCP Server API v1.3.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getPlenaryDocumentsFeed](../README.md) / handleGetPlenaryDocumentsFeed

# Function: handleGetPlenaryDocumentsFeed()

> **handleGetPlenaryDocumentsFeed**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getPlenaryDocumentsFeed.ts:29](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getPlenaryDocumentsFeed.ts#L29)

Handles the get_plenary_documents_feed MCP tool request.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetPlenaryDocumentsFeedSchema](../../../schemas/ep/feed/variables/GetPlenaryDocumentsFeedSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing recently updated plenary documents data

## Security

Input is validated with Zod before any API call.
