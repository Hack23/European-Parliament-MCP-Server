[**European Parliament MCP Server API v1.3.19**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/lifecycleStatistics](../README.md) / getLifecycleStatistics

# Function: getLifecycleStatistics()

> **getLifecycleStatistics**(`options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LifecycleStatisticsModel`](../interfaces/LifecycleStatisticsModel.md)\>

Defined in: [utils/lifecycleStatistics.ts:391](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/lifecycleStatistics.ts#L391)

Build (or return cached) lifecycle statistics for the latest N procedures.

The corpus is cached for [CACHE\_TTL\_MS](../variables/CACHE_TTL_MS.md); subsequent callers within
the window receive the same model instance for free. Refreshing is lazy:
a stale cache is rebuilt on the next call rather than on a timer, so
idle processes pay no background cost. Cache and in-flight builds are
keyed by `corpusSize` so distinct sample sizes never share a model.

## Parameters

### options?

Optional overrides

#### corpusSize?

`number`

Number of procedures to sample (default: [CORPUS\_SIZE](../variables/CORPUS_SIZE.md))

#### deadline?

`number`

Optional wall-clock deadline (epoch ms) for the
  underlying [fetchEventsBounded](fetchEventsBounded.md) loop. When set, the rebuild stops
  queueing additional events fetches once the deadline is reached and
  builds the model from whatever was gathered (possibly empty). This is
  how the request path keeps a cold-cache rebuild from starving its own
  rate-limit budget. Concurrent callers that omit `deadline` still share
  the same in-flight build, so the budget set by the first caller wins.

#### forceRefresh?

`boolean`

Ignore cached model and rebuild

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LifecycleStatisticsModel`](../interfaces/LifecycleStatisticsModel.md)\>

The lifecycle statistics model (possibly partial when `deadline`
  fires before the full corpus has been fetched)

## Security

The corpus contains only procedure types, event types, and dates —
  no PII. Bounded concurrency (≤8) prevents API rate-limit exhaustion.

## Since

0.8.0
