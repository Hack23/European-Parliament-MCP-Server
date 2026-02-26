[**European Parliament MCP Server API v0.8.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [di/tokens](../README.md) / TOKENS

# Variable: TOKENS

> `const` **TOKENS**: `object`

Defined in: [di/tokens.ts:30](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/di/tokens.ts#L30)

Centralised DI token registry.

`as const` makes the registry object itself readonly and ensures each
property value is inferred as `symbol` (not widened to `object`).
For type-level uniqueness, each `Symbol(...)` is a distinct runtime value;
`DIToken` is the union of all token values for generic container utilities.

## Type Declaration

### AuditLogger

> `readonly` **AuditLogger**: `symbol`

GDPR-compliant audit logger
(`AuditLogger` from `utils/auditLogger`)

### EPClient

> `readonly` **EPClient**: `symbol`

European Parliament API client
(`EuropeanParliamentClient` from `clients/europeanParliamentClient`)

### HealthService

> `readonly` **HealthService**: `symbol`

Server health-check service
(`HealthService` from `services/HealthService`)

### MetricsService

> `readonly` **MetricsService**: `symbol`

Performance metrics collection service
(`MetricsService` from `services/MetricsService`)

### RateLimiter

> `readonly` **RateLimiter**: `symbol`

Token-bucket rate limiter for EP API calls
(`RateLimiter` from `utils/rateLimiter`)
