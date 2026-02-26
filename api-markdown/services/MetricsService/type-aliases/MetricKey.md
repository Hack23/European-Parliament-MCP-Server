[**European Parliament MCP Server API v0.8.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [services/MetricsService](../README.md) / MetricKey

# Type Alias: MetricKey

> **MetricKey** = [`MetricName`](../enumerations/MetricName.md) \| `string` & `object`

Defined in: [services/MetricsService.ts:16](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/services/MetricsService.ts#L16)

Preferred type for metric name parameters.

Using [MetricName](../enumerations/MetricName.md) values provides compile-time safety and IDE
auto-complete; raw `string` is accepted for backward compatibility and
for ad-hoc metrics outside the standard set.
