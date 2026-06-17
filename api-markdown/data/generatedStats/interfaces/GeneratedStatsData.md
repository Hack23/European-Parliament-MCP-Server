[**European Parliament MCP Server API v1.3.24**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [data/generatedStats](../README.md) / GeneratedStatsData

# Interface: GeneratedStatsData

Defined in: [data/generatedStats.ts:387](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L387)

Top-level container for all precomputed European Parliament statistics.

## Properties

### analysisSummary

> **analysisSummary**: `object`

Defined in: [data/generatedStats.ts:403](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L403)

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

Defined in: [data/generatedStats.ts:399](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L399)

Per-category statistical rankings across years

***

### coveragePeriod

> **coveragePeriod**: `object`

Defined in: [data/generatedStats.ts:391](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L391)

Underlying dataset coverage period (always 2004–2026)

#### from

> **from**: `number`

#### to

> **to**: `number`

***

### dataSource

> **dataSource**: `string`

Defined in: [data/generatedStats.ts:395](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L395)

Attribution string for the data source

***

### generatedAt

> **generatedAt**: `string`

Defined in: [data/generatedStats.ts:389](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L389)

ISO 8601 timestamp of when stats were last generated

***

### methodologyVersion

> **methodologyVersion**: `string`

Defined in: [data/generatedStats.ts:393](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L393)

Version of the stats generation methodology

***

### predictions

> **predictions**: [`PredictionYear`](PredictionYear.md)[]

Defined in: [data/generatedStats.ts:401](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L401)

Predicted activity for future years (2027–2031)

***

### yearlyStats

> **yearlyStats**: [`YearlyStats`](YearlyStats.md)[]

Defined in: [data/generatedStats.ts:397](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L397)

Annual statistics for each year in the coverage period
