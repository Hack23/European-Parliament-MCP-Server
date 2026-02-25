[**European Parliament MCP Server API v0.8.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/rateLimiter](../README.md) / RateLimiterStatus

# Interface: RateLimiterStatus

Defined in: [utils/rateLimiter.ts:22](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/utils/rateLimiter.ts#L22)

Rate-limiter status snapshot (used by health checks and monitoring).

## Properties

### availableTokens

> **availableTokens**: `number`

Defined in: [utils/rateLimiter.ts:24](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/utils/rateLimiter.ts#L24)

Number of tokens currently available in the bucket

***

### maxTokens

> **maxTokens**: `number`

Defined in: [utils/rateLimiter.ts:26](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/utils/rateLimiter.ts#L26)

Maximum capacity of the token bucket

***

### utilizationPercent

> **utilizationPercent**: `number`

Defined in: [utils/rateLimiter.ts:28](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/utils/rateLimiter.ts#L28)

Percentage of the bucket currently consumed (0–100)
