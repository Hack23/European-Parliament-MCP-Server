[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [data/generatedStats](../README.md) / GeneratedStatsData

# Interface: GeneratedStatsData

Defined in: [data/generatedStats.ts:203](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L203)

Top-level container for all precomputed European Parliament statistics.

## Properties

### analysisSummary

> **analysisSummary**: `object`

Defined in: [data/generatedStats.ts:219](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L219)

High-level analytical summary of trends and key findings

#### averageAnnualLegislativeOutput

> **averageAnnualLegislativeOutput**: `number`

Mean annual legislative output across all years

#### keyFindings

> **keyFindings**: `string`[]

Notable analytical findings

#### legislativeProductivityTrend

> **legislativeProductivityTrend**: `string`

Long-term legislative productivity trend description

#### lowestActivityYear

> **lowestActivityYear**: `number`

Year with the lowest total activity

#### overallTrend

> **overallTrend**: `string`

Overall multi-year trend description

#### peakActivityYear

> **peakActivityYear**: `number`

Year with the highest total activity

***

### categoryRankings

> **categoryRankings**: [`CategoryRanking`](CategoryRanking.md)[]

Defined in: [data/generatedStats.ts:215](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L215)

Per-category statistical rankings across years

***

### coveragePeriod

> **coveragePeriod**: `object`

Defined in: [data/generatedStats.ts:207](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L207)

Underlying dataset coverage period (always 2004–2025)

#### from

> **from**: `number`

#### to

> **to**: `number`

***

### dataSource

> **dataSource**: `string`

Defined in: [data/generatedStats.ts:211](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L211)

Attribution string for the data source

***

### generatedAt

> **generatedAt**: `string`

Defined in: [data/generatedStats.ts:205](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L205)

ISO 8601 timestamp of when stats were last generated

***

### methodologyVersion

> **methodologyVersion**: `string`

Defined in: [data/generatedStats.ts:209](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L209)

Version of the stats generation methodology

***

### predictions

> **predictions**: [`PredictionYear`](PredictionYear.md)[]

Defined in: [data/generatedStats.ts:217](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L217)

Predicted activity for future years (2026–2030)

***

### yearlyStats

> **yearlyStats**: [`YearlyStats`](YearlyStats.md)[]

Defined in: [data/generatedStats.ts:213](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L213)

Annual statistics for each year in the coverage period
