[**European Parliament MCP Server API v0.8.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [services/HealthService](../README.md) / HealthStatusLevel

# Type Alias: HealthStatusLevel

> **HealthStatusLevel** = `"healthy"` \| `"degraded"` \| `"unhealthy"`

Defined in: [services/HealthService.ts:36](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/services/HealthService.ts#L36)

Overall server health verdict.

| Value       | Meaning |
|-------------|---------|
| `healthy`   | All subsystems operating normally |
| `degraded`  | One or more subsystems impaired but functional |
| `unhealthy` | Critical subsystem failure |
