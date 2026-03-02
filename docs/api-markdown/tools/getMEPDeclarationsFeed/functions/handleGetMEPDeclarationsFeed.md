[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getMEPDeclarationsFeed](../README.md) / handleGetMEPDeclarationsFeed

# Function: handleGetMEPDeclarationsFeed()

> **handleGetMEPDeclarationsFeed**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getMEPDeclarationsFeed.ts:24](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getMEPDeclarationsFeed.ts#L24)

Handles the get_mep_declarations_feed MCP tool request.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetMEPDeclarationsFeedSchema](../../../schemas/ep/feed/variables/GetMEPDeclarationsFeedSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing recently updated MEP declaration data

## Security

Input is validated with Zod before any API call.
