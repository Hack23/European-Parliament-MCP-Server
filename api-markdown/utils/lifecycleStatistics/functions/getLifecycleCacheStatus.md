[**European Parliament MCP Server API v1.4.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/lifecycleStatistics](../README.md) / getLifecycleCacheStatus

# Function: getLifecycleCacheStatus()

> **getLifecycleCacheStatus**(`corpusSize?`): [`LifecycleCacheStatus`](../interfaces/LifecycleCacheStatus.md)

Defined in: [utils/lifecycleStatistics.ts:510](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/lifecycleStatistics.ts#L510)

Return an observable snapshot of the lifecycle-statistics cache for the
given corpus size. Never triggers a rebuild and never blocks.

The function distinguishes the three states a cache entry can be in:
 - `WARM`  — entry exists and is unexpired (`getCachedLifecycleStatistics`
   would return the model)
 - `STALE` — entry exists but its TTL has elapsed; the next request that
   calls `getLifecycleStatistics` will trigger a rebuild
 - `COLD`  — no entry has ever been produced for this corpus size

## Parameters

### corpusSize?

`number` = `CORPUS_SIZE`

Sample size to inspect (default: [CORPUS\_SIZE](../variables/CORPUS_SIZE.md))

## Returns

[`LifecycleCacheStatus`](../interfaces/LifecycleCacheStatus.md)

Cache status snapshot

## Security

No network calls; safe to use inside health endpoints and
  tight request budgets.

## Since

0.9.0
