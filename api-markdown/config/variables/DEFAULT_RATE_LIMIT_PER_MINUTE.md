[**European Parliament MCP Server API v1.3.30**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / [config](../README.md) / DEFAULT\_RATE\_LIMIT\_PER\_MINUTE

# Variable: DEFAULT\_RATE\_LIMIT\_PER\_MINUTE

> `const` **DEFAULT\_RATE\_LIMIT\_PER\_MINUTE**: `100` = `100`

Defined in: [config.ts:48](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/config.ts#L48)

Default rate limit applied to EP API requests (requests per minute).
Consumed by `baseClient.ts` (`DEFAULT_RATE_LIMIT_TOKENS`) and by the CLI
health/help output so that the displayed default always matches the
enforced default.
