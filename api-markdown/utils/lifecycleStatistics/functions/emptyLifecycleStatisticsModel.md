[**European Parliament MCP Server API v1.3.23**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/lifecycleStatistics](../README.md) / emptyLifecycleStatisticsModel

# Function: emptyLifecycleStatisticsModel()

> **emptyLifecycleStatisticsModel**(): [`LifecycleStatisticsModel`](../interfaces/LifecycleStatisticsModel.md)

Defined in: [utils/lifecycleStatistics.ts:529](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/lifecycleStatistics.ts#L529)

An empty lifecycle model that callers can use as a fast fallback when the
corpus rebuild fails or exceeds its time budget. With this model every
lookup returns `undefined` so forecasts gracefully degrade to the
`INSUFFICIENT_DATA` heuristic basis without aborting the request.

## Returns

[`LifecycleStatisticsModel`](../interfaces/LifecycleStatisticsModel.md)
