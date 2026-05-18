[**European Parliament MCP Server API v1.3.8**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [server/toolRegistry](../README.md) / dispatchToolCall

# Function: dispatchToolCall()

> **dispatchToolCall**(`name`, `args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../../tools/shared/types/interfaces/ToolResult.md)\>

Defined in: [server/toolRegistry.ts:334](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/toolRegistry.ts#L334)

Dispatches a tool call to the registered handler.

Feed tool calls are automatically tracked by the [feedHealthTracker](../../../services/FeedHealthTracker/variables/feedHealthTracker.md)
so that the `get_server_health` tool can report per-feed availability
without making upstream API calls. Both thrown errors and in-band
"unavailable" envelopes carrying an operational `errorCode`
(e.g. `UPSTREAM_TIMEOUT`, `UPSTREAM_ERROR`, `RATE_LIMIT`,
`ENRICHMENT_FAILED`) are recorded as failures; `NOT_FOUND` and
empty-but-healthy responses are recorded as successes.

## Parameters

### name

`string`

Tool name from the MCP `CallTool` request

### args

`unknown`

Validated tool arguments

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../../tools/shared/types/interfaces/ToolResult.md)\>

Tool execution result

## Throws

If the tool name is not recognized
