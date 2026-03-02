[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getMEPsFeed](../README.md) / handleGetMEPsFeed

# Function: handleGetMEPsFeed()

> **handleGetMEPsFeed**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getMEPsFeed.ts:24](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getMEPsFeed.ts#L24)

Handles the get_meps_feed MCP tool request.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetMEPsFeedSchema](../../../schemas/ep/feed/variables/GetMEPsFeedSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing recently updated MEP data

## Security

Input is validated with Zod before any API call.
