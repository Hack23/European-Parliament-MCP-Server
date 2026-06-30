[**European Parliament MCP Server API v1.3.32**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/feedUtils](../README.md) / FeedErrorCode

# Type Alias: FeedErrorCode

> **FeedErrorCode** = `"ENRICHMENT_FAILED"` \| `"UPSTREAM_TIMEOUT"` \| `"UPSTREAM_ERROR"` \| `"RATE_LIMIT"` \| `"NOT_FOUND"`

Defined in: [tools/shared/feedUtils.ts:106](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/feedUtils.ts#L106)

Machine-readable error code for a feed failure.

Enables programmatic retry/skip/fallback logic by downstream consumers.
Individual feed handlers opt into emitting these codes — not every feed
classifies every upstream failure mode the same way, so consumers should
always check for the presence of `errorCode` before branching on its
value. See each tool's documentation for the codes it currently emits.

- `ENRICHMENT_FAILED` — EP API internal enrichment/POST step returned an
  error-in-body (HTTP 200 with `error` field and no `data` array). Retryable.
- `UPSTREAM_TIMEOUT` — The upstream request exceeded the configured timeout.
  Retryable; consumers may back off and retry with a narrower timeframe.
- `UPSTREAM_ERROR` — A non-timeout, non-rate-limit upstream error occurred
  (typically HTTP 5xx, but a feed handler may also surface upstream 404 as
  `UPSTREAM_ERROR` with `retryable: true` when the empty-feed window is
  considered transient rather than a permanent miss). Retryable.
  `upstream.statusCode` is present.
- `RATE_LIMIT` — Either the upstream API returned HTTP 429 (too many
  requests) or the local token-bucket rate limiter in BaseEPClient rejected
  the request before any upstream call was made. Local rate-limit responses
  **omit** the `upstream` field, while genuine upstream 429s include
  `upstream.statusCode: 429`. Both cases are retryable and surface a
  `retryAfterMs` value when the limiter reported one. Consumers can use the
  presence/absence of `upstream` to distinguish the two cases. Not every
  feed handler distinguishes local vs upstream 429 — handlers that don't
  simply emit `RATE_LIMIT` with `upstream.statusCode: 429` for both.
- `NOT_FOUND` — The upstream returned HTTP 404 and the feed handler treats
  the empty window as a definitive non-retryable miss (e.g. EP recess or
  low-activity period). Currently emitted only by `get_events_feed`; other
  feed handlers may still emit `UPSTREAM_ERROR` with `upstream.statusCode: 404`
  and `retryable: true` for the same upstream condition. Consumers that
  want a single, code-agnostic check should branch on `status` /
  `retryable` rather than `errorCode`. `upstream.statusCode` is `404` when
  present.
