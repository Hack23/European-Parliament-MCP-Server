[**European Parliament MCP Server API v1.3.29**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/sentimentTracker](../README.md) / sentimentTracker

# Function: sentimentTracker()

> **sentimentTracker**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/sentimentTracker.ts:842](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/sentimentTracker.ts#L842)

Compute political-group sentiment scores over a configurable time window.

Implementation of the MCP `sentiment_tracker` tool. Combines current EP API
MEP composition with DOCEO roll-call vote (RCV) records inside the requested
`timeframe` window to derive a per-group sentiment score, trend, volatility,
polarization index, and consensus/divisive topic lists. Falls back to a
seat-share-only proxy with `confidenceLevel: 'LOW'` and an explicit
`methodology` note when DOCEO coverage is insufficient.

## Parameters

### params

Validated tool parameters (see [SentimentTrackerSchema](../variables/SentimentTrackerSchema.md))

#### timeframe

`"last_month"` \| `"last_quarter"` \| `"last_year"` = `...`

#### groupId?

`string` = `...`

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

A [ToolResult](../../shared/types/interfaces/ToolResult.md) containing the sentiment report or a structured
  error response on failure.
