[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getControlledVocabulariesFeed](../README.md) / handleGetControlledVocabulariesFeed

# Function: handleGetControlledVocabulariesFeed()

> **handleGetControlledVocabulariesFeed**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getControlledVocabulariesFeed.ts:24](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getControlledVocabulariesFeed.ts#L24)

Handles the get_controlled_vocabularies_feed MCP tool request.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetControlledVocabulariesFeedSchema](../../../schemas/ep/feed/variables/GetControlledVocabulariesFeedSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing recently updated controlled vocabulary data

## Security

Input is validated with Zod before any API call.
