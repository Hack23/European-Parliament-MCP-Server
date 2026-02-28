[**European Parliament MCP Server API v0.9.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [di/container](../README.md) / createDefaultContainer

# Function: createDefaultContainer()

> **createDefaultContainer**(): [`DIContainer`](../classes/DIContainer.md)

Defined in: [di/container.ts:167](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/di/container.ts#L167)

Create a pre-configured DI container with the standard MCP server services
registered as singletons.

Registered services:
- `TOKENS.RateLimiter`   → [RateLimiter](../../../utils/rateLimiter/classes/RateLimiter.md) (standard EP API configuration)
- `TOKENS.MetricsService` → [MetricsService](../../../services/MetricsService/classes/MetricsService.md)
- `TOKENS.AuditLogger`   → AuditLogger (global singleton)
- `TOKENS.HealthService` → [HealthService](../../../services/HealthService/classes/HealthService.md)

## Returns

[`DIContainer`](../classes/DIContainer.md)

A fully configured [DIContainer](../classes/DIContainer.md) with all standard services registered

## Example

```typescript
const container = createDefaultContainer();
const health = container.resolve<HealthService>(TOKENS.HealthService);
console.log(health.checkHealth());
```

## Since

0.8.0
