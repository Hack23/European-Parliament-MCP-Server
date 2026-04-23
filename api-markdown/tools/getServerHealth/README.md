[**European Parliament MCP Server API v1.2.13**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / tools/getServerHealth

# tools/getServerHealth

MCP Tool: get_server_health

Returns server health status and per-feed availability diagnostics.
Does NOT make upstream API calls — reports cached status from recent
feed tool invocations.

**Intelligence Perspective:** Operational awareness of data source
availability is critical for reliable intelligence products.

**Business Perspective:** Provides dashboard-ready health metrics
and enables clients to adapt data collection strategies based on
current feed availability.

ISMS Policy: MO-001 (Monitoring and Alerting), PE-001 (Performance Standards)

## Interfaces

- [FeedProjection](interfaces/FeedProjection.md)

## Variables

- [GetServerHealthSchema](variables/GetServerHealthSchema.md)
- [getServerHealthToolMetadata](variables/getServerHealthToolMetadata.md)

## Functions

- [handleGetServerHealth](functions/handleGetServerHealth.md)
