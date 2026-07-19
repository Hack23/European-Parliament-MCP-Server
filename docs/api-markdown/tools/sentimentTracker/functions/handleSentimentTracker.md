[**European Parliament MCP Server API v1.4.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/sentimentTracker](../README.md) / handleSentimentTracker

# Function: handleSentimentTracker()

> **handleSentimentTracker**(`args`): `Promise`\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/sentimentTracker.ts:907](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/sentimentTracker.ts#L907)

MCP `CallTool` handler entry point for `sentiment_tracker`.

Validates the raw input arguments against [SentimentTrackerSchema](../variables/SentimentTrackerSchema.md)
and delegates execution to [sentimentTracker](sentimentTracker.md).

## Parameters

### args

`unknown`

Raw, untrusted MCP `CallTool` arguments

## Returns

`Promise`\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

The same [ToolResult](../../shared/types/interfaces/ToolResult.md) produced by [sentimentTracker](sentimentTracker.md)
