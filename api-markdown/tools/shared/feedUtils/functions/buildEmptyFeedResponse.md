[**European Parliament MCP Server API v1.2.7**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/feedUtils](../README.md) / buildEmptyFeedResponse

# Function: buildEmptyFeedResponse()

> **buildEmptyFeedResponse**(`warning?`): [`ToolResult`](../../types/interfaces/ToolResult.md)

Defined in: [tools/shared/feedUtils.ts:70](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/feedUtils.ts#L70)

Build an empty feed response with a `dataQualityWarnings` array.

Returns the same JSON-LD envelope shape (`data` + `@context`) as the
normal success path so callers do not need to branch on response shape.

## Parameters

### warning?

`string` = `'EP Open Data Portal returned no data for this feed — likely no updates in the requested timeframe'`

Human-readable warning message describing why the feed is empty

## Returns

[`ToolResult`](../../types/interfaces/ToolResult.md)
