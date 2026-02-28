[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [services/HealthService](../README.md) / HealthStatus

# Interface: HealthStatus

Defined in: [services/HealthService.ts:57](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/HealthService.ts#L57)

Full health status returned by [HealthService.checkHealth](../classes/HealthService.md#checkhealth).

## Properties

### cache

> **cache**: [`CacheHealthStatus`](CacheHealthStatus.md)

Defined in: [services/HealthService.ts:66](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/HealthService.ts#L66)

Cache subsystem status

***

### epApiReachable

> **epApiReachable**: `boolean` \| `null`

Defined in: [services/HealthService.ts:64](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/HealthService.ts#L64)

Whether the EP API base URL is reachable (based on recent metrics).
`null` means no API calls have been recorded yet — reachability is unknown.

***

### rateLimiter

> **rateLimiter**: [`RateLimiterStatus`](../../../utils/rateLimiter/interfaces/RateLimiterStatus.md)

Defined in: [services/HealthService.ts:68](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/HealthService.ts#L68)

Rate-limiter subsystem status

***

### status

> **status**: [`HealthStatusLevel`](../type-aliases/HealthStatusLevel.md)

Defined in: [services/HealthService.ts:59](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/HealthService.ts#L59)

Overall health verdict

***

### timestamp

> **timestamp**: `string`

Defined in: [services/HealthService.ts:70](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/HealthService.ts#L70)

ISO-8601 timestamp of this health snapshot

***

### uptimeMs

> **uptimeMs**: `number`

Defined in: [services/HealthService.ts:72](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/HealthService.ts#L72)

Server uptime in milliseconds
