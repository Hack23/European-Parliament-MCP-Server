[**European Parliament MCP Server API v1.3.8**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/sentimentTracker](../README.md) / SentimentTrackerSchema

# Variable: SentimentTrackerSchema

> `const` **SentimentTrackerSchema**: `ZodObject`\<[`SentimentTrackerParams`](../type-aliases/SentimentTrackerParams.md)\>

Defined in: [tools/sentimentTracker.ts:39](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/sentimentTracker.ts#L39)

Zod input schema for the `sentiment_tracker` MCP tool. Optional
`groupId` filters the analysis to a single political group; `timeframe`
is an informational label (the current implementation always uses the
latest available MEP composition data, not historical time series).
