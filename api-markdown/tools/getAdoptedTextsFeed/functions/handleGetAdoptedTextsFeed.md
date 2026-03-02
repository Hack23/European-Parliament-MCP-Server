[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getAdoptedTextsFeed](../README.md) / handleGetAdoptedTextsFeed

# Function: handleGetAdoptedTextsFeed()

> **handleGetAdoptedTextsFeed**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getAdoptedTextsFeed.ts:24](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getAdoptedTextsFeed.ts#L24)

Handles the get_adopted_texts_feed MCP tool request.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetAdoptedTextsFeedSchema](../../../schemas/ep/feed/variables/GetAdoptedTextsFeedSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing recently updated adopted text data

## Security

Input is validated with Zod before any API call.
