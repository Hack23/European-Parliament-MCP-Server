[**European Parliament MCP Server API v1.3.37**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/lifecycleStatistics](../README.md) / LifecycleCacheState

# Type Alias: LifecycleCacheState

> **LifecycleCacheState** = `"WARM"` \| `"STALE"` \| `"COLD"`

Defined in: [utils/lifecycleStatistics.ts:471](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/lifecycleStatistics.ts#L471)

Observable cache state, exposed via `get_server_health.lifecycleCache` and
read by [getLifecycleCacheStatus](../functions/getLifecycleCacheStatus.md) to surface warmup observability.

| State   | Meaning |
|---------|---------|
| `WARM`  | Cache entry exists and is still within the [CACHE\_TTL\_MS](../variables/CACHE_TTL_MS.md) window |
| `STALE` | Cache entry exists but its TTL has expired (next request will rebuild) |
| `COLD`  | No cache entry has ever been produced for this corpus size |
