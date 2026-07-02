[**European Parliament MCP Server API v1.3.33**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/lifecycleStatistics](../README.md) / getCachedLifecycleStatistics

# Function: getCachedLifecycleStatistics()

> **getCachedLifecycleStatistics**(`corpusSize?`): [`LifecycleStatisticsModel`](../interfaces/LifecycleStatisticsModel.md) \| `null`

Defined in: [utils/lifecycleStatistics.ts:451](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/lifecycleStatistics.ts#L451)

Returns the cached lifecycle-statistics model for the given corpus size if
present and unexpired, otherwise `null`. Never triggers a rebuild and
never blocks.

Intended for request-path callers (e.g. `monitor_legislative_pipeline`) that
need to avoid the cold-cache corpus rebuild competing with their own
rate-limited `/events` fan-out. Out-of-band warmup (background jobs,
sibling tools whose primary purpose is the corpus itself) should keep
using [getLifecycleStatistics](getLifecycleStatistics.md) which will rebuild on miss.

## Parameters

### corpusSize?

`number` = `CORPUS_SIZE`

Sample size to look up (default: [CORPUS\_SIZE](../variables/CORPUS_SIZE.md)).

## Returns

[`LifecycleStatisticsModel`](../interfaces/LifecycleStatisticsModel.md) \| `null`

The cached model, or `null` on cache miss / expiry.

## Security

No network calls; safe to use inside tight request budgets.

## Since

0.8.0
