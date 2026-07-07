[**European Parliament MCP Server API v1.3.37**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/analyzeLegislativeEffectiveness](../README.md) / DataSourceStatus

# Type Alias: DataSourceStatus

> **DataSourceStatus** = `"OK"` \| `"EMPTY"` \| `"TIMEOUT"` \| `"UNAVAILABLE"`

Defined in: [tools/analyzeLegislativeEffectiveness.ts:48](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/analyzeLegislativeEffectiveness.ts#L48)

Per-source data availability flag surfaced in the response envelope.

- `OK` — fetch succeeded and at least one item contributed to the metric.
- `EMPTY` — fetch succeeded but no items matched the subject/date filter.
- `TIMEOUT` — per-source 6 s budget expired; metric reported as zero.
- `UNAVAILABLE` — EP API returned an error.
