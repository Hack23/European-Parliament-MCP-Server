[**European Parliament MCP Server API v1.1.0**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / [types](../README.md) / DataAvailability

# Type Alias: DataAvailability

> **DataAvailability** = `"AVAILABLE"` \| `"PARTIAL"` \| `"ESTIMATED"` \| `"UNAVAILABLE"`

Defined in: [types/index.ts:90](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/index.ts#L90)

Data availability status for intelligence analysis metrics.

- `AVAILABLE`   — Full data retrieved from EP API; metric is reliable.
- `PARTIAL`     — Some data retrieved; metric may be incomplete.
- `ESTIMATED`   — Metric derived from proxy/indirect data sources.
- `UNAVAILABLE` — Required data not provided by the EP API endpoint;
                  the associated metric value is `null`.
