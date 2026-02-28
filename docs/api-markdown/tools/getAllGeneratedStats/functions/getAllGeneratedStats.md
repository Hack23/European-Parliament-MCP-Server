[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getAllGeneratedStats](../README.md) / getAllGeneratedStats

# Function: getAllGeneratedStats()

> **getAllGeneratedStats**(`params`): [`ToolResult`](../../shared/types/interfaces/ToolResult.md)

Defined in: [tools/getAllGeneratedStats.ts:220](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getAllGeneratedStats.ts#L220)

Retrieve precomputed EP activity statistics with optional year/category filtering.

The response always includes `coveragePeriod` (the full dataset range, 2004–2025)
and `requestedPeriod` (the user-supplied year filter). The `analysisSummary` covers
the full dataset with a `coverageNote` clarifying scope when filters narrow the range.

## Parameters

### params

#### category

`"documents"` \| `"all"` \| `"events"` \| `"speeches"` \| `"procedures"` \| `"resolutions"` \| `"declarations"` \| `"plenary_sessions"` \| `"legislative_acts"` \| `"roll_call_votes"` \| `"committee_meetings"` \| `"parliamentary_questions"` \| `"adopted_texts"` \| `"political_groups"` \| `"mep_turnover"` = `...`

#### includeMonthlyBreakdown

`boolean` = `...`

#### includePredictions

`boolean` = `...`

#### includeRankings

`boolean` = `...`

#### yearFrom?

`number` = `...`

#### yearTo?

`number` = `...`

## Returns

[`ToolResult`](../../shared/types/interfaces/ToolResult.md)
