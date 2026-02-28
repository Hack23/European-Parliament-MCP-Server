[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/rateLimiter](../README.md) / createStandardRateLimiter

# Function: createStandardRateLimiter()

> **createStandardRateLimiter**(): [`RateLimiter`](../classes/RateLimiter.md)

Defined in: [utils/rateLimiter.ts:376](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/rateLimiter.ts#L376)

Creates a [RateLimiter](../classes/RateLimiter.md) pre-configured for EP API usage.

Default configuration: **100 tokens per minute** — aligned with the
European Parliament Open Data Portal's recommended fair-use policy.

## Returns

[`RateLimiter`](../classes/RateLimiter.md)

A new [RateLimiter](../classes/RateLimiter.md) instance with standard EP API settings

## Example

```typescript
const rateLimiter = createStandardRateLimiter();
const result = await rateLimiter.removeTokens(1);
if (result.allowed) {
  const data = await fetchFromEPAPI('/meps');
}
```

## Security

Ensures sustainable OSINT collection rates from the EP API and
  prevents service disruption. Per ISMS Policy AC-003, rate limiting is a
  mandatory access control for external API calls.

## Since

0.8.0
