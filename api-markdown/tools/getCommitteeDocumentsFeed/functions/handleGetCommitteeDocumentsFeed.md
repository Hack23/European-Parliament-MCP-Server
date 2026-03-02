[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getCommitteeDocumentsFeed](../README.md) / handleGetCommitteeDocumentsFeed

# Function: handleGetCommitteeDocumentsFeed()

> **handleGetCommitteeDocumentsFeed**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getCommitteeDocumentsFeed.ts:24](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getCommitteeDocumentsFeed.ts#L24)

Handles the get_committee_documents_feed MCP tool request.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetCommitteeDocumentsFeedSchema](../../../schemas/ep/feed/variables/GetCommitteeDocumentsFeedSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing recently updated committee document data

## Security

Input is validated with Zod before any API call.
