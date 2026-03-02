[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getEventsFeed](../README.md) / handleGetEventsFeed

# Function: handleGetEventsFeed()

> **handleGetEventsFeed**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getEventsFeed.ts:24](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getEventsFeed.ts#L24)

Handles the get_events_feed MCP tool request.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetEventsFeedSchema](../../../schemas/ep/feed/variables/GetEventsFeedSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing recently updated event data

## Security

Input is validated with Zod before any API call.
