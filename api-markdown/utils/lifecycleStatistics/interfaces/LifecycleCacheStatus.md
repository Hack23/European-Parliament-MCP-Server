[**European Parliament MCP Server API v1.3.35**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/lifecycleStatistics](../README.md) / LifecycleCacheStatus

# Interface: LifecycleCacheStatus

Defined in: [utils/lifecycleStatistics.ts:478](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/lifecycleStatistics.ts#L478)

Diagnostic snapshot of the lifecycle-statistics cache for the given corpus
size. Never triggers a rebuild and never blocks; intended for health
endpoints and warmup-scheduler observability.

## Properties

### ageMs

> **ageMs**: `number` \| `null`

Defined in: [utils/lifecycleStatistics.ts:485](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/lifecycleStatistics.ts#L485)

Age of the cached model in milliseconds (since `builtAt`). `null` when
the cache is `COLD`.

***

### corpusSize

> **corpusSize**: `number` \| `null`

Defined in: [utils/lifecycleStatistics.ts:489](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/lifecycleStatistics.ts#L489)

`corpusSize` of the cached model. `null` when the cache is `COLD`.

***

### state

> **state**: [`LifecycleCacheState`](../type-aliases/LifecycleCacheState.md)

Defined in: [utils/lifecycleStatistics.ts:480](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/lifecycleStatistics.ts#L480)

Current cache state.
