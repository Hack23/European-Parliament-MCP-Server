[**European Parliament MCP Server API v1.4.5**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [data/generatedStats](../README.md) / GENERATED\_STATS

# Variable: GENERATED\_STATS

> `const` **GENERATED\_STATS**: [`GeneratedStatsData`](../interfaces/GeneratedStatsData.md)

Defined in: [data/generatedStats.ts:1213](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L1213)

Precomputed European Parliament activity dataset (2004-2026) used by
the `get_all_generated_stats` MCP tool.

Includes monthly breakdowns and yearly totals for plenary sessions,
legislative acts, roll-call votes, committee meetings, parliamentary
questions, resolutions, speeches, adopted texts, procedures, events,
documents, MEP turnover and declarations, plus per-year
[PoliticalLandscapeData](../interfaces/PoliticalLandscapeData.md) snapshots.

Data is refreshed weekly by an agentic workflow; see
`src/tools/getAllGeneratedStats.ts` for retrieval and filtering logic.
