[**European Parliament MCP Server API v0.9.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [services/MetricsService](../README.md) / MetricName

# Enumeration: MetricName

Defined in: [services/MetricsService.ts:30](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/MetricsService.ts#L30)

Typed metric name constants for MCP server and EP API instrumentation.

Using an enum prevents typos in metric names and enables IDE
auto-complete throughout the codebase.

## Example

```typescript
metricsService.incrementCounter(MetricName.EP_API_CALL_COUNT, 1);
metricsService.incrementCounter(MetricName.EP_CACHE_HIT_COUNT, 1);
```

## Enumeration Members

### EP\_API\_CALL\_COUNT

> **EP\_API\_CALL\_COUNT**: `"ep_api_call_count"`

Defined in: [services/MetricsService.ts:32](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/MetricsService.ts#L32)

Total EP API calls (label: `endpoint`)

***

### EP\_API\_ERROR\_COUNT

> **EP\_API\_ERROR\_COUNT**: `"ep_api_error_count"`

Defined in: [services/MetricsService.ts:34](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/MetricsService.ts#L34)

Failed EP API calls

***

### EP\_CACHE\_HIT\_COUNT

> **EP\_CACHE\_HIT\_COUNT**: `"ep_cache_hit_count"`

Defined in: [services/MetricsService.ts:36](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/MetricsService.ts#L36)

Cache hits for EP API responses

***

### EP\_CACHE\_MISS\_COUNT

> **EP\_CACHE\_MISS\_COUNT**: `"ep_cache_miss_count"`

Defined in: [services/MetricsService.ts:38](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/MetricsService.ts#L38)

Cache misses for EP API responses
