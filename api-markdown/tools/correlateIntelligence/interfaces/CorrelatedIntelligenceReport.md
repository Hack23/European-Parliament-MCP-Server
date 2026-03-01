[**European Parliament MCP Server API v1.0.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/correlateIntelligence](../README.md) / CorrelatedIntelligenceReport

# Interface: CorrelatedIntelligenceReport

Defined in: [tools/correlateIntelligence.ts:135](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/correlateIntelligence.ts#L135)

Full correlated intelligence report

## Extends

- [`OsintStandardOutput`](../../shared/types/interfaces/OsintStandardOutput.md)

## Properties

### alerts

> **alerts**: [`CorrelationAlert`](CorrelationAlert.md)[]

Defined in: [tools/correlateIntelligence.ts:144](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/correlateIntelligence.ts#L144)

***

### analysisTime

> **analysisTime**: `string`

Defined in: [tools/correlateIntelligence.ts:137](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/correlateIntelligence.ts#L137)

***

### confidenceLevel

> **confidenceLevel**: `"HIGH"` \| `"MEDIUM"` \| `"LOW"`

Defined in: [tools/shared/types.ts:35](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/types.ts#L35)

Confidence level of this analysis based on data availability and quality.
- `HIGH`   — Full EP API data available
- `MEDIUM` — Partial data; indicative results
- `LOW`    — Insufficient data; treat with caution

#### Inherited from

[`OsintStandardOutput`](../../shared/types/interfaces/OsintStandardOutput.md).[`confidenceLevel`](../../shared/types/interfaces/OsintStandardOutput.md#confidencelevel)

***

### correlationId

> **correlationId**: `string`

Defined in: [tools/correlateIntelligence.ts:136](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/correlateIntelligence.ts#L136)

***

### correlations

> **correlations**: `object`

Defined in: [tools/correlateIntelligence.ts:145](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/correlateIntelligence.ts#L145)

#### coalitionFracture

> **coalitionFracture**: [`CoalitionFractureCorrelation`](CoalitionFractureCorrelation.md) \| `null`

#### influenceAnomaly

> **influenceAnomaly**: [`InfluenceAnomalyCorrelation`](InfluenceAnomalyCorrelation.md)[]

#### networkProfiles

> **networkProfiles**: [`NetworkProfileCorrelation`](NetworkProfileCorrelation.md)[]

***

### dataAvailability

> **dataAvailability**: [`DataAvailability`](../../../types/type-aliases/DataAvailability.md)

Defined in: [tools/correlateIntelligence.ts:159](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/correlateIntelligence.ts#L159)

Explicit marker indicating whether correlation data was available from dependent tools

***

### dataFreshness

> **dataFreshness**: `string`

Defined in: [tools/shared/types.ts:47](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/types.ts#L47)

Freshness indicator for the underlying data (e.g., real-time EP API
fetch timestamp or description of data currency).

#### Inherited from

[`OsintStandardOutput`](../../shared/types/interfaces/OsintStandardOutput.md).[`dataFreshness`](../../shared/types/interfaces/OsintStandardOutput.md#datafreshness)

***

### methodology

> **methodology**: `string`

Defined in: [tools/shared/types.ts:41](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/types.ts#L41)

Methodology description explaining how the analysis was computed,
including data sources, scoring models, and any limitations.

#### Inherited from

[`OsintStandardOutput`](../../shared/types/interfaces/OsintStandardOutput.md).[`methodology`](../../shared/types/interfaces/OsintStandardOutput.md#methodology)

***

### scope

> **scope**: `object`

Defined in: [tools/correlateIntelligence.ts:138](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/correlateIntelligence.ts#L138)

#### groups

> **groups**: `string`[]

#### mepIds

> **mepIds**: `string`[]

#### networkAnalysisIncluded

> **networkAnalysisIncluded**: `boolean`

#### sensitivityLevel

> **sensitivityLevel**: `string`

***

### sourceAttribution

> **sourceAttribution**: `string`

Defined in: [tools/shared/types.ts:53](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/types.ts#L53)

Attribution to the European Parliament Open Data Portal and any other
data sources used in this analysis.

#### Inherited from

[`OsintStandardOutput`](../../shared/types/interfaces/OsintStandardOutput.md).[`sourceAttribution`](../../shared/types/interfaces/OsintStandardOutput.md#sourceattribution)

***

### summary

> **summary**: `object`

Defined in: [tools/correlateIntelligence.ts:150](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/correlateIntelligence.ts#L150)

#### correlationsFound

> **correlationsFound**: `number`

#### criticalAlerts

> **criticalAlerts**: `number`

#### highAlerts

> **highAlerts**: `number`

#### lowAlerts

> **lowAlerts**: `number`

#### mediumAlerts

> **mediumAlerts**: `number`

#### totalAlerts

> **totalAlerts**: `number`
