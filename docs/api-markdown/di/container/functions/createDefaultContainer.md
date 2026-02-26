[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [di/container](../README.md) / createDefaultContainer

# Function: createDefaultContainer()

> **createDefaultContainer**(): [`DIContainer`](../classes/DIContainer.md)

Defined in: [di/container.ts:149](https://github.com/Hack23/European-Parliament-MCP-Server/blob/67dbd67a8f5629591a17b9785bfa0977f7023afb/src/di/container.ts#L149)

Create a pre-configured DI container with the standard MCP server services
registered as singletons.

Registered services:
- `TOKENS.RateLimiter`   → [RateLimiter](../../../utils/rateLimiter/classes/RateLimiter.md) (standard EP API configuration)
- `TOKENS.MetricsService` → [MetricsService](../../../services/MetricsService/classes/MetricsService.md)
- `TOKENS.AuditLogger`   → AuditLogger (global singleton)
- `TOKENS.HealthService` → [HealthService](../../../services/HealthService/classes/HealthService.md)

## Returns

[`DIContainer`](../classes/DIContainer.md)

## Example

```typescript
const container = createDefaultContainer();
const health = container.resolve<HealthService>(TOKENS.HealthService);
console.log(health.checkHealth());
```
