[**European Parliament MCP Server API v1.2.20**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/feedUtils](../README.md) / FeedErrorCode

# Type Alias: FeedErrorCode

> **FeedErrorCode** = `"ENRICHMENT_FAILED"` \| `"UPSTREAM_TIMEOUT"` \| `"UPSTREAM_ERROR"` \| `"RATE_LIMIT"`

Defined in: [tools/shared/feedUtils.ts:80](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/feedUtils.ts#L80)

Machine-readable error code for a feed failure.

Enables programmatic retry/skip/fallback logic by downstream consumers:
- `ENRICHMENT_FAILED` — EP API internal enrichment/POST step returned an
  error-in-body (HTTP 200 with `error` field and no `data` array).
- `UPSTREAM_TIMEOUT` — The upstream request exceeded the configured timeout.
- `UPSTREAM_ERROR` — A non-timeout, non-rate-limit upstream error occurred.
- `RATE_LIMIT` — The upstream API returned HTTP 429 (too many requests).
