[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getParliamentaryQuestionsFeed](../README.md) / handleGetParliamentaryQuestionsFeed

# Function: handleGetParliamentaryQuestionsFeed()

> **handleGetParliamentaryQuestionsFeed**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getParliamentaryQuestionsFeed.ts:24](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getParliamentaryQuestionsFeed.ts#L24)

Handles the get_parliamentary_questions_feed MCP tool request.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetParliamentaryQuestionsFeedSchema](../../../schemas/ep/feed/variables/GetParliamentaryQuestionsFeedSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing recently updated parliamentary question data

## Security

Input is validated with Zod before any API call.
