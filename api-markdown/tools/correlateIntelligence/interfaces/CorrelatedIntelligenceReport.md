[**European Parliament MCP Server API v1.3.33**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/correlateIntelligence](../README.md) / CorrelatedIntelligenceReport

# Interface: CorrelatedIntelligenceReport

Defined in: [tools/correlateIntelligence.ts:127](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/correlateIntelligence.ts#L127)

Full correlated intelligence report

## Extends

- [`OsintStandardOutput`](../../shared/types/interfaces/OsintStandardOutput.md)

## Properties

### alerts

> **alerts**: [`CorrelationAlert`](CorrelationAlert.md)[]

Defined in: [tools/correlateIntelligence.ts:136](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/correlateIntelligence.ts#L136)

***

### analysisTime

> **analysisTime**: `string`

Defined in: [tools/correlateIntelligence.ts:129](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/correlateIntelligence.ts#L129)

***

### confidenceLevel

> **confidenceLevel**: [`ConfidenceLevel`](../../shared/types/type-aliases/ConfidenceLevel.md)

Defined in: [tools/shared/types.ts:54](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/types.ts#L54)

Confidence level of the analysis: HIGH, MEDIUM, or LOW.
Derived from the volume and quality of underlying data.

#### Inherited from

[`OsintStandardOutput`](../../shared/types/interfaces/OsintStandardOutput.md).[`confidenceLevel`](../../shared/types/interfaces/OsintStandardOutput.md#confidencelevel)

***

### correlationId

> **correlationId**: `string`

Defined in: [tools/correlateIntelligence.ts:128](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/correlateIntelligence.ts#L128)

***

### correlations

> **correlations**: `object`

Defined in: [tools/correlateIntelligence.ts:137](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/correlateIntelligence.ts#L137)

#### coalitionFracture

> **coalitionFracture**: [`CoalitionFractureCorrelation`](CoalitionFractureCorrelation.md) \| `null`

#### influenceAnomaly

> **influenceAnomaly**: [`InfluenceAnomalyCorrelation`](InfluenceAnomalyCorrelation.md)[]

#### networkProfiles

> **networkProfiles**: [`NetworkProfileCorrelation`](NetworkProfileCorrelation.md)[]

***

### dataAvailability

> **dataAvailability**: [`DataAvailability`](../../../types/type-aliases/DataAvailability.md)

Defined in: [tools/correlateIntelligence.ts:151](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/correlateIntelligence.ts#L151)

Explicit marker indicating whether correlation data was available from dependent tools

***

### dataFreshness

> **dataFreshness**: `string`

Defined in: [tools/shared/types.ts:64](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/types.ts#L64)

Human-readable indicator of how recent the underlying data is.

#### Inherited from

[`OsintStandardOutput`](../../shared/types/interfaces/OsintStandardOutput.md).[`dataFreshness`](../../shared/types/interfaces/OsintStandardOutput.md#datafreshness)

***

### dataQualityWarnings

> **dataQualityWarnings**: `string`[]

Defined in: [tools/shared/types.ts:79](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/types.ts#L79)

Explicit warnings about data quality issues, unavailable metrics,
or limitations that affect the reliability of this analysis.
Empty array when all data is available and reliable.

ISMS Policy: A.8.11 (Data integrity), GDPR Article 5(1)(d) (Accuracy)

#### Inherited from

[`OsintStandardOutput`](../../shared/types/interfaces/OsintStandardOutput.md).[`dataQualityWarnings`](../../shared/types/interfaces/OsintStandardOutput.md#dataqualitywarnings)

***

### methodology

> **methodology**: `string`

Defined in: [tools/shared/types.ts:59](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/types.ts#L59)

Description of the analytical methodology used to produce this output.

#### Inherited from

[`OsintStandardOutput`](../../shared/types/interfaces/OsintStandardOutput.md).[`methodology`](../../shared/types/interfaces/OsintStandardOutput.md#methodology)

***

### scope

> **scope**: `object`

Defined in: [tools/correlateIntelligence.ts:130](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/correlateIntelligence.ts#L130)

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

Defined in: [tools/shared/types.ts:70](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/types.ts#L70)

Attribution string identifying the European Parliament Open Data Portal
data sources used in this analysis.

#### Inherited from

[`OsintStandardOutput`](../../shared/types/interfaces/OsintStandardOutput.md).[`sourceAttribution`](../../shared/types/interfaces/OsintStandardOutput.md#sourceattribution)

***

### summary

> **summary**: `object`

Defined in: [tools/correlateIntelligence.ts:142](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/correlateIntelligence.ts#L142)

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
