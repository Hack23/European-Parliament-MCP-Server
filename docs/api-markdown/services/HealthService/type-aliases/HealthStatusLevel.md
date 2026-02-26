[**European Parliament MCP Server API v0.8.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [services/HealthService](../README.md) / HealthStatusLevel

# Type Alias: HealthStatusLevel

> **HealthStatusLevel** = `"healthy"` \| `"degraded"` \| `"unhealthy"`

Defined in: [services/HealthService.ts:36](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/services/HealthService.ts#L36)

Overall server health verdict.

| Value       | Meaning |
|-------------|---------|
| `healthy`   | All subsystems operating normally |
| `degraded`  | One or more subsystems impaired but functional |
| `unhealthy` | Critical subsystem failure |
