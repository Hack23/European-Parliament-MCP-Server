[**European Parliament MCP Server API v1.3.26**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/sentimentTracker](../README.md) / SentimentTrackerSchema

# Variable: SentimentTrackerSchema

> `const` **SentimentTrackerSchema**: `ZodObject`\<[`SentimentTrackerParams`](../type-aliases/SentimentTrackerParams.md)\>

Defined in: [tools/sentimentTracker.ts:44](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/sentimentTracker.ts#L44)

Zod input schema for the `sentiment_tracker` MCP tool. Optional
`groupId` filters the analysis to a single political group; `timeframe`
selects the DOCEO RCV aggregation window (last 30 / 90 / 365 days).
