[**European Parliament MCP Server API v1.3.35**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/lifecycleStatistics](../README.md) / StageDwellStatistics

# Interface: StageDwellStatistics

Defined in: [utils/lifecycleStatistics.ts:58](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/lifecycleStatistics.ts#L58)

Statistics for a single `(procedureType, stage)` pair.

All numbers are in days. `sampleSize` exposes how many observations the
statistics were derived from — callers should treat low-sample cells as
less reliable and may degrade `forecastBasis` to `INSUFFICIENT_DATA`.

## Properties

### medianDwellDays

> **medianDwellDays**: `number`

Defined in: [utils/lifecycleStatistics.ts:60](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/lifecycleStatistics.ts#L60)

Median number of days a procedure dwells at this stage before moving on.

***

### medianRemainingDays

> **medianRemainingDays**: `number`

Defined in: [utils/lifecycleStatistics.ts:67](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/lifecycleStatistics.ts#L67)

Median number of days remaining from this stage until the final event of
the same procedure. Used as the forecasting baseline.

***

### p95DwellDays

> **p95DwellDays**: `number`

Defined in: [utils/lifecycleStatistics.ts:62](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/lifecycleStatistics.ts#L62)

95th-percentile dwell — exceeding this is the bottleneck threshold.

***

### sampleSize

> **sampleSize**: `number`

Defined in: [utils/lifecycleStatistics.ts:69](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/lifecycleStatistics.ts#L69)

Number of observations contributing to the dwell distribution.
