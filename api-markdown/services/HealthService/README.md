[**European Parliament MCP Server API v0.9.1**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / services/HealthService

# services/HealthService

Health Check Service

Provides a lightweight, synchronous-friendly health snapshot for the
MCP server.  The snapshot is designed to be consumed by:
- Monitoring integrations (CloudWatch, Prometheus, etc.)
- Future CLI health commands

**Intelligence Perspective:** Operational health metrics are a
prerequisite for reliable intelligence product delivery—degraded
connectivity or exhausted rate limits must surface immediately.

**Business Perspective:** Health endpoints support SLA dashboards and
enable proactive incident response before customers are impacted.

ISMS Policy: MO-001 (Monitoring and Alerting), PE-001 (Performance Standards)

## Classes

- [HealthService](classes/HealthService.md)

## Interfaces

- [CacheHealthStatus](interfaces/CacheHealthStatus.md)
- [HealthStatus](interfaces/HealthStatus.md)

## Type Aliases

- [HealthStatusLevel](type-aliases/HealthStatusLevel.md)
- [RateLimiterHealthStatus](type-aliases/RateLimiterHealthStatus.md)
