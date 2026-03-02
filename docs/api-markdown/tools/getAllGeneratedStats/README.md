[**European Parliament MCP Server API v1.1.0**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / tools/getAllGeneratedStats

# tools/getAllGeneratedStats

MCP Tool: get_all_generated_stats

Returns precomputed European Parliament activity statistics covering
parliamentary terms EP6–EP10 (2004–2025), including monthly activity
breakdowns, category rankings with percentiles, analytical commentary,
and trend-based predictions for 2026–2030.

The underlying data is static and designed to be refreshed weekly by
an agentic workflow. No live EP API calls are made by this tool.

**Intelligence Perspective:** Enables rapid longitudinal analysis of
EP legislative productivity, committee workload, and parliamentary
engagement metrics across two decades—supporting trend identification,
term-over-term comparisons, and predictive modelling.

**Business Perspective:** Provides pre-built analytics for policy
consultancies, think-tanks, and academic researchers who need
ready-made historical benchmarks without incurring API latency.

**Marketing Perspective:** Showcases the depth of the MCP server's
analytical capabilities with rich, pre-formatted intelligence products.

ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
Data source: European Parliament Open Data Portal — data.europarl.europa.eu

## Type Aliases

- [GetAllGeneratedStatsParams](type-aliases/GetAllGeneratedStatsParams.md)

## Variables

- [GetAllGeneratedStatsSchema](variables/GetAllGeneratedStatsSchema.md)
- [getAllGeneratedStatsToolMetadata](variables/getAllGeneratedStatsToolMetadata.md)

## Functions

- [getAllGeneratedStats](functions/getAllGeneratedStats.md)
- [handleGetAllGeneratedStats](functions/handleGetAllGeneratedStats.md)
