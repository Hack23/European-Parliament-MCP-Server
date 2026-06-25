[**European Parliament MCP Server API v1.3.28**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / [config](../README.md) / DEFAULT\_LIFECYCLE\_WARMUP\_INTERVAL\_MS

# Variable: DEFAULT\_LIFECYCLE\_WARMUP\_INTERVAL\_MS

> `const` **DEFAULT\_LIFECYCLE\_WARMUP\_INTERVAL\_MS**: `number`

Defined in: [config.ts:60](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/config.ts#L60)

Default warmup interval (ms) for the lifecycle-statistics cache. Chosen to
be 5 minutes shy of the 30-minute corpus TTL so the cache is refreshed
before it expires. Configurable via `EP_LIFECYCLE_WARMUP_INTERVAL_MS`
(clamped to [[LIFECYCLE\_WARMUP\_MIN\_INTERVAL\_MS](LIFECYCLE_WARMUP_MIN_INTERVAL_MS.md),
[LIFECYCLE\_WARMUP\_MAX\_INTERVAL\_MS](LIFECYCLE_WARMUP_MAX_INTERVAL_MS.md)]).
