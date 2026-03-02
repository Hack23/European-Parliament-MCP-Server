[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [data/generatedStats](../README.md) / GeneratedStatsData

# Interface: GeneratedStatsData

Defined in: [data/generatedStats.ts:412](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L412)

Top-level container for all precomputed European Parliament statistics.

## Properties

### analysisSummary

> **analysisSummary**: `object`

Defined in: [data/generatedStats.ts:428](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L428)

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

Defined in: [data/generatedStats.ts:424](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L424)

Per-category statistical rankings across years

***

### coveragePeriod

> **coveragePeriod**: `object`

Defined in: [data/generatedStats.ts:416](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L416)

Underlying dataset coverage period (always 2004–2025)

#### from

> **from**: `number`

#### to

> **to**: `number`

***

### dataSource

> **dataSource**: `string`

Defined in: [data/generatedStats.ts:420](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L420)

Attribution string for the data source

***

### generatedAt

> **generatedAt**: `string`

Defined in: [data/generatedStats.ts:414](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L414)

ISO 8601 timestamp of when stats were last generated

***

### methodologyVersion

> **methodologyVersion**: `string`

Defined in: [data/generatedStats.ts:418](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L418)

Version of the stats generation methodology

***

### predictions

> **predictions**: [`PredictionYear`](PredictionYear.md)[]

Defined in: [data/generatedStats.ts:426](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L426)

Predicted activity for future years (2026–2030)

***

### yearlyStats

> **yearlyStats**: [`YearlyStats`](YearlyStats.md)[]

Defined in: [data/generatedStats.ts:422](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L422)

Annual statistics for each year in the coverage period
