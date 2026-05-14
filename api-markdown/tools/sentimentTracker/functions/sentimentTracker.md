[**European Parliament MCP Server API v1.3.4**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/sentimentTracker](../README.md) / sentimentTracker

# Function: sentimentTracker()

> **sentimentTracker**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/sentimentTracker.ts:255](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/sentimentTracker.ts#L255)

Compute political-group institutional-positioning sentiment scores.

Implementation of the MCP `sentiment_tracker` tool. Aggregates current
MEP group composition into per-group sentiment scores (seat-share
proxies), computes a polarization index, derives consensus and
divisive topics and returns an overall parliament sentiment score.

## Parameters

### params

Validated tool parameters
  (see [SentimentTrackerSchema](../variables/SentimentTrackerSchema.md))

#### timeframe

`"last_month"` \| `"last_quarter"` \| `"last_year"` = `...`

#### groupId?

`string` = `...`

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

A [ToolResult](../../shared/types/interfaces/ToolResult.md) containing the sentiment report or a
  structured error response on failure
