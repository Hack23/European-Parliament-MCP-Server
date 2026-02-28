[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/performance](../README.md) / PerformanceThresholds

# Interface: PerformanceThresholds

Defined in: [utils/performance.ts:50](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/performance.ts#L50)

Warning thresholds for performance alerting.

Operations that exceed these thresholds should be flagged for
review in dashboards or log-based alerting rules.

## Properties

### p95WarningMs

> **p95WarningMs**: `number`

Defined in: [utils/performance.ts:52](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/performance.ts#L52)

Warn when p95 exceeds this value (milliseconds)

***

### p99WarningMs

> **p99WarningMs**: `number`

Defined in: [utils/performance.ts:54](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/performance.ts#L54)

Warn when p99 exceeds this value (milliseconds)

***

### avgWarningMs?

> `optional` **avgWarningMs**: `number`

Defined in: [utils/performance.ts:56](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/performance.ts#L56)

Warn when average exceeds this value (milliseconds)
