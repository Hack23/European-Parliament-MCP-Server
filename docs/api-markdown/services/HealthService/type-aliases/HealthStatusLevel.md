[**European Parliament MCP Server API v1.3.36**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [services/HealthService](../README.md) / HealthStatusLevel

# Type Alias: HealthStatusLevel

> **HealthStatusLevel** = `"healthy"` \| `"degraded"` \| `"unhealthy"`

Defined in: [services/HealthService.ts:34](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/HealthService.ts#L34)

Overall server health verdict.

| Value       | Meaning |
|-------------|---------|
| `healthy`   | All subsystems operating normally |
| `degraded`  | One or more subsystems impaired but functional |
| `unhealthy` | Critical subsystem failure |
