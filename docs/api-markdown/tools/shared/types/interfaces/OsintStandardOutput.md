[**European Parliament MCP Server API v0.9.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/types](../README.md) / OsintStandardOutput

# Interface: OsintStandardOutput

Defined in: [tools/shared/types.ts:28](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/types.ts#L28)

Standard OSINT output fields required on every intelligence tool response.

Ensures consistent methodology transparency, confidence communication, and
data provenance across all OSINT intelligence tools.

**Confidence Level Criteria:**
- `HIGH`   — Real EP API data with full voting statistics available (totalVotes > 50 or complete membership data)
- `MEDIUM` — Partial EP API data (some statistics available but limited sample)
- `LOW`    — Insufficient EP API data; results are indicative only

ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege), AU-002 (Audit Logging)

## Extended by

- [`CorrelatedIntelligenceReport`](../../../correlateIntelligence/interfaces/CorrelatedIntelligenceReport.md)

## Properties

### confidenceLevel

> **confidenceLevel**: `"HIGH"` \| `"MEDIUM"` \| `"LOW"`

Defined in: [tools/shared/types.ts:35](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/types.ts#L35)

Confidence level of this analysis based on data availability and quality.
- `HIGH`   — Full EP API data available
- `MEDIUM` — Partial data; indicative results
- `LOW`    — Insufficient data; treat with caution

***

### dataFreshness

> **dataFreshness**: `string`

Defined in: [tools/shared/types.ts:47](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/types.ts#L47)

Freshness indicator for the underlying data (e.g., real-time EP API
fetch timestamp or description of data currency).

***

### methodology

> **methodology**: `string`

Defined in: [tools/shared/types.ts:41](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/types.ts#L41)

Methodology description explaining how the analysis was computed,
including data sources, scoring models, and any limitations.

***

### sourceAttribution

> **sourceAttribution**: `string`

Defined in: [tools/shared/types.ts:53](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/types.ts#L53)

Attribution to the European Parliament Open Data Portal and any other
data sources used in this analysis.
