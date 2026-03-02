[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getCorporateBodiesFeed](../README.md) / handleGetCorporateBodiesFeed

# Function: handleGetCorporateBodiesFeed()

> **handleGetCorporateBodiesFeed**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getCorporateBodiesFeed.ts:24](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getCorporateBodiesFeed.ts#L24)

Handles the get_corporate_bodies_feed MCP tool request.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetCorporateBodiesFeedSchema](../../../schemas/ep/feed/variables/GetCorporateBodiesFeedSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing recently updated corporate body data

## Security

Input is validated with Zod before any API call.
