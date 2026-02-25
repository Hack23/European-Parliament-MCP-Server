[**European Parliament MCP Server API v0.8.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [services/HealthService](../README.md) / HealthService

# Class: HealthService

Defined in: [services/HealthService.ts:94](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/services/HealthService.ts#L94)

Health Check Service

Aggregates status from the rate limiter and metrics service to
produce a structured [HealthStatus](../interfaces/HealthStatus.md) snapshot.

The check is intentionally **synchronous-safe** – it never makes
network calls.  Network reachability is inferred from recent
metrics (EP API error rate).

## Example

```typescript
const healthService = new HealthService(rateLimiter, metricsService);
const status = healthService.checkHealth();
console.log(status.status); // 'healthy' | 'degraded' | 'unhealthy'
```

## Constructors

### Constructor

> **new HealthService**(`rateLimiter`, `metricsService`): `HealthService`

Defined in: [services/HealthService.ts:97](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/services/HealthService.ts#L97)

#### Parameters

##### rateLimiter

[`RateLimiter`](../../../utils/rateLimiter/classes/RateLimiter.md)

##### metricsService

[`MetricsService`](../../MetricsService/classes/MetricsService.md)

#### Returns

`HealthService`

## Properties

### metricsService

> `private` `readonly` **metricsService**: [`MetricsService`](../../MetricsService/classes/MetricsService.md)

Defined in: [services/HealthService.ts:99](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/services/HealthService.ts#L99)

***

### rateLimiter

> `private` `readonly` **rateLimiter**: [`RateLimiter`](../../../utils/rateLimiter/classes/RateLimiter.md)

Defined in: [services/HealthService.ts:98](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/services/HealthService.ts#L98)

***

### startTime

> `private` `readonly` **startTime**: `number`

Defined in: [services/HealthService.ts:95](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/services/HealthService.ts#L95)

## Methods

### buildCacheStatus()

> `private` **buildCacheStatus**(): [`CacheHealthStatus`](../interfaces/CacheHealthStatus.md)

Defined in: [services/HealthService.ts:164](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/services/HealthService.ts#L164)

Build a descriptive cache status object.
Cyclomatic complexity: 2

#### Returns

[`CacheHealthStatus`](../interfaces/CacheHealthStatus.md)

***

### buildRateLimiterStatus()

> `private` **buildRateLimiterStatus**(): [`RateLimiterStatus`](../../../utils/rateLimiter/interfaces/RateLimiterStatus.md)

Defined in: [services/HealthService.ts:135](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/services/HealthService.ts#L135)

Build rate-limiter snapshot by delegating to RateLimiter.getStatus().
Cyclomatic complexity: 1

#### Returns

[`RateLimiterStatus`](../../../utils/rateLimiter/interfaces/RateLimiterStatus.md)

***

### checkHealth()

> **checkHealth**(): [`HealthStatus`](../interfaces/HealthStatus.md)

Defined in: [services/HealthService.ts:113](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/services/HealthService.ts#L113)

Produce a health status snapshot.

Checks:
1. Rate-limiter token availability (degraded if < 10 %)
2. EP API error counter (unhealthy if recent errors > 0 with no successes)

#### Returns

[`HealthStatus`](../interfaces/HealthStatus.md)

Structured [HealthStatus](../interfaces/HealthStatus.md) object

***

### deriveOverallStatus()

> `private` **deriveOverallStatus**(`rateLimiter`, `epApiReachable`): [`HealthStatusLevel`](../type-aliases/HealthStatusLevel.md)

Defined in: [services/HealthService.ts:181](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/services/HealthService.ts#L181)

Derive the overall health verdict from sub-system checks.
Cyclomatic complexity: 3

#### Parameters

##### rateLimiter

[`RateLimiterStatus`](../../../utils/rateLimiter/interfaces/RateLimiterStatus.md)

##### epApiReachable

`boolean` | `null`

#### Returns

[`HealthStatusLevel`](../type-aliases/HealthStatusLevel.md)

***

### isEpApiReachable()

> `private` **isEpApiReachable**(): `boolean` \| `null`

Defined in: [services/HealthService.ts:147](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/services/HealthService.ts#L147)

Determine EP API reachability from recorded metrics.
Cyclomatic complexity: 2

Returns `null` when no API calls have been recorded yet (unknown state),
`false` when all calls failed (error count >= call count > 0),
`true` when at least some calls succeeded.

#### Returns

`boolean` \| `null`
