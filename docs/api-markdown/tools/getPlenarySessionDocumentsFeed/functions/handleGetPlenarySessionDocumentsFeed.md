[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getPlenarySessionDocumentsFeed](../README.md) / handleGetPlenarySessionDocumentsFeed

# Function: handleGetPlenarySessionDocumentsFeed()

> **handleGetPlenarySessionDocumentsFeed**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getPlenarySessionDocumentsFeed.ts:24](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getPlenarySessionDocumentsFeed.ts#L24)

Handles the get_plenary_session_documents_feed MCP tool request.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetPlenarySessionDocumentsFeedSchema](../../../schemas/ep/feed/variables/GetPlenarySessionDocumentsFeedSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing recently updated plenary session document data

## Security

Input is validated with Zod before any API call.
