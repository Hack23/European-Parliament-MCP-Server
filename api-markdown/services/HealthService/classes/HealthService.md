[**European Parliament MCP Server API v0.9.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [services/HealthService](../README.md) / HealthService

# Class: HealthService

Defined in: [services/HealthService.ts:94](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/HealthService.ts#L94)

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

Defined in: [services/HealthService.ts:115](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/HealthService.ts#L115)

Creates a new HealthService instance.

#### Parameters

##### rateLimiter

[`RateLimiter`](../../../utils/rateLimiter/classes/RateLimiter.md)

Rate limiter whose token availability is checked as
  part of the degraded-state heuristic

##### metricsService

[`MetricsService`](../../MetricsService/classes/MetricsService.md)

Metrics service providing EP API call and error
  counters used to infer reachability

#### Returns

`HealthService`

#### Example

```typescript
const healthService = new HealthService(
  createStandardRateLimiter(),
  new MetricsService()
);
```

#### Since

0.8.0

## Properties

### metricsService

> `private` `readonly` **metricsService**: [`MetricsService`](../../MetricsService/classes/MetricsService.md)

Defined in: [services/HealthService.ts:117](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/HealthService.ts#L117)

Metrics service providing EP API call and error
  counters used to infer reachability

***

### rateLimiter

> `private` `readonly` **rateLimiter**: [`RateLimiter`](../../../utils/rateLimiter/classes/RateLimiter.md)

Defined in: [services/HealthService.ts:116](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/HealthService.ts#L116)

Rate limiter whose token availability is checked as
  part of the degraded-state heuristic

***

### startTime

> `private` `readonly` **startTime**: `number`

Defined in: [services/HealthService.ts:95](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/HealthService.ts#L95)

## Methods

### buildCacheStatus()

> `private` **buildCacheStatus**(): [`CacheHealthStatus`](../interfaces/CacheHealthStatus.md)

Defined in: [services/HealthService.ts:199](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/HealthService.ts#L199)

Build a descriptive cache status object.
Cyclomatic complexity: 2

#### Returns

[`CacheHealthStatus`](../interfaces/CacheHealthStatus.md)

***

### buildRateLimiterStatus()

> `private` **buildRateLimiterStatus**(): [`RateLimiterStatus`](../../../utils/rateLimiter/interfaces/RateLimiterStatus.md)

Defined in: [services/HealthService.ts:170](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/HealthService.ts#L170)

Build rate-limiter snapshot by delegating to RateLimiter.getStatus().
Cyclomatic complexity: 1

#### Returns

[`RateLimiterStatus`](../../../utils/rateLimiter/interfaces/RateLimiterStatus.md)

***

### checkHealth()

> **checkHealth**(): [`HealthStatus`](../interfaces/HealthStatus.md)

Defined in: [services/HealthService.ts:148](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/HealthService.ts#L148)

Produces a health status snapshot.

Checks:
1. Rate-limiter token availability (degraded if < 10 %)
2. EP API error counter (unhealthy if recent errors > 0 with no successes)

The check is **synchronous-safe** — it never makes network calls.
Reachability is inferred from cached metric counters.

#### Returns

[`HealthStatus`](../interfaces/HealthStatus.md)

Structured [HealthStatus](../interfaces/HealthStatus.md) object with `status`,
  `epApiReachable`, `cache`, `rateLimiter`, `timestamp`, and `uptimeMs`

#### Throws

If the underlying metrics or rate-limiter service throws
  unexpectedly (should not occur under normal operating conditions)

#### Example

```typescript
const healthService = new HealthService(rateLimiter, metricsService);
const status = healthService.checkHealth();
if (status.status !== 'healthy') {
  console.warn('Server degraded:', status);
}
```

#### Since

0.8.0

***

### deriveOverallStatus()

> `private` **deriveOverallStatus**(`rateLimiter`, `epApiReachable`): [`HealthStatusLevel`](../type-aliases/HealthStatusLevel.md)

Defined in: [services/HealthService.ts:216](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/HealthService.ts#L216)

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

Defined in: [services/HealthService.ts:182](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/HealthService.ts#L182)

Determine EP API reachability from recorded metrics.
Cyclomatic complexity: 2

Returns `null` when no API calls have been recorded yet (unknown state),
`false` when all calls failed (error count >= call count > 0),
`true` when at least some calls succeeded.

#### Returns

`boolean` \| `null`
