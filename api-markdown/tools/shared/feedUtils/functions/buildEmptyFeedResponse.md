[**European Parliament MCP Server API v1.2.6**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/feedUtils](../README.md) / buildEmptyFeedResponse

# Function: buildEmptyFeedResponse()

> **buildEmptyFeedResponse**(): [`ToolResult`](../../types/interfaces/ToolResult.md)

Defined in: [tools/shared/feedUtils.ts:35](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/feedUtils.ts#L35)

Build an empty feed response with a `dataQualityWarnings` array indicating
that the upstream EP API returned 404 — likely no updates in the requested
timeframe.

Returns the same JSON-LD envelope shape (`data` + `@context`) as the
normal success path so callers do not need to branch on response shape.

## Returns

[`ToolResult`](../../types/interfaces/ToolResult.md)
