[**European Parliament MCP Server API v1.2.20**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/feedUtils](../README.md) / buildEmptyFeedResponse

# Function: buildEmptyFeedResponse()

> **buildEmptyFeedResponse**(`reason?`, `meta?`): [`ToolResult`](../../types/interfaces/ToolResult.md)

Defined in: [tools/shared/feedUtils.ts:301](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/feedUtils.ts#L301)

Build an empty feed response under the uniform contract.

Returns the same envelope shape as [buildFeedSuccessResponse](buildFeedSuccessResponse.md)
with `status: "unavailable"` and `items: []`. This helper is used
when the upstream returned 404 / empty body / error-in-body and we
have no fresh data to report.

`"degraded"` is intentionally **not** accepted here because it
denotes "partial data with warnings" — for that case, call
[buildFeedSuccessResponse](buildFeedSuccessResponse.md) with the partial payload and the
warnings (`status` will be derived as `"degraded"`).

## Parameters

### reason?

`string` = `EMPTY_FEED_REASON`

Human-readable reason describing why the feed is empty
                (also surfaced in `dataQualityWarnings` for backwards
                compatibility with consumers reading that field).

### meta?

[`FeedErrorMeta`](../interfaces/FeedErrorMeta.md)

Optional machine-readable failure metadata. When provided,
                `errorCode`, `retryable`, and `upstream` are included in the
                response envelope so downstream consumers can classify the
                failure and decide whether to retry, fall back, or skip.

## Returns

[`ToolResult`](../../types/interfaces/ToolResult.md)
