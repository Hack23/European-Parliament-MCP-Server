[**European Parliament MCP Server API v0.9.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [services/MetricsService](../README.md) / MetricKey

# Type Alias: MetricKey

> **MetricKey** = [`MetricName`](../enumerations/MetricName.md) \| `string` & `object`

Defined in: [services/MetricsService.ts:16](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/MetricsService.ts#L16)

Preferred type for metric name parameters.

Using [MetricName](../enumerations/MetricName.md) values provides compile-time safety and IDE
auto-complete; raw `string` is accepted for backward compatibility and
for ad-hoc metrics outside the standard set.
