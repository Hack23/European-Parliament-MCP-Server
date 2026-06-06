[**European Parliament MCP Server API v1.3.16**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/analyzeCommitteeActivity](../README.md) / DataSourceStatus

# Type Alias: DataSourceStatus

> **DataSourceStatus** = `"OK"` \| `"EMPTY"` \| `"TIMEOUT"` \| `"UNAVAILABLE"`

Defined in: [tools/analyzeCommitteeActivity.ts:53](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/analyzeCommitteeActivity.ts#L53)

Per-source data availability status.

- `OK`: fetched and at least one item matched the committee/date filter.
- `EMPTY`: fetched successfully but no items matched.
- `TIMEOUT`: per-source 5s budget expired; data not populated.
- `UNAVAILABLE`: EP API returned an error.
