[**European Parliament MCP Server API v1.3.38**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getAllGeneratedStats](../README.md) / GetAllGeneratedStatsParams

# Type Alias: GetAllGeneratedStatsParams

> **GetAllGeneratedStatsParams** = `object`

Defined in: [tools/getAllGeneratedStats.ts:112](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getAllGeneratedStats.ts#L112)

Validated parameter type for the `get_all_generated_stats` tool,
inferred from [GetAllGeneratedStatsSchema](../variables/GetAllGeneratedStatsSchema.md).

## Type Declaration

### category

> **category**: `"documents"` \| `"all"` \| `"events"` \| `"speeches"` \| `"procedures"` \| `"resolutions"` \| `"declarations"` \| `"plenary_sessions"` \| `"legislative_acts"` \| `"roll_call_votes"` \| `"committee_meetings"` \| `"parliamentary_questions"` \| `"adopted_texts"` \| `"political_groups"` \| `"mep_turnover"`

### includeMonthlyBreakdown

> **includeMonthlyBreakdown**: `boolean`

### includePredictions

> **includePredictions**: `boolean`

### includeRankings

> **includeRankings**: `boolean`

### yearFrom?

> `optional` **yearFrom?**: `number`

### yearTo?

> `optional` **yearTo?**: `number`
