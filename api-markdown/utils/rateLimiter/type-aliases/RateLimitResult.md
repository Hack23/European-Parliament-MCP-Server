[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/rateLimiter](../README.md) / RateLimitResult

# Type Alias: RateLimitResult

> **RateLimitResult** = \{ `allowed`: `true`; `remainingTokens`: `number`; \} \| \{ `allowed`: `false`; `remainingTokens`: `number`; `retryAfterMs`: `number`; \}

Defined in: [utils/rateLimiter.ts:43](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/rateLimiter.ts#L43)

Result returned by [RateLimiter.removeTokens](../classes/RateLimiter.md#removetokens).

Discriminated union: when `allowed` is `true`, tokens were consumed.
When `allowed` is `false`, the wait would have exceeded the timeout and
`retryAfterMs` is always present with a value ≥ 1 (milliseconds until the
bucket is expected to have enough tokens; treat `1` as "retry immediately").

**Note:** `remainingTokens` is always a non-negative integer
(`Math.floor` of the internal fractional bucket state). This differs from
[RateLimiter.getAvailableTokens](../classes/RateLimiter.md#getavailabletokens), which may return a fractional value.
