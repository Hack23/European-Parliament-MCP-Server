[**European Parliament MCP Server API v1.2.13**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/types](../README.md) / OsintStandardOutput

# Interface: OsintStandardOutput

Defined in: [tools/shared/types.ts:40](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/types.ts#L40)

## Extended by

- [`CorrelatedIntelligenceReport`](../../../correlateIntelligence/interfaces/CorrelatedIntelligenceReport.md)

## Properties

### confidenceLevel

> **confidenceLevel**: [`ConfidenceLevel`](../type-aliases/ConfidenceLevel.md)

Defined in: [tools/shared/types.ts:45](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/types.ts#L45)

Confidence level of the analysis: HIGH, MEDIUM, or LOW.
Derived from the volume and quality of underlying data.

***

### dataFreshness

> **dataFreshness**: `string`

Defined in: [tools/shared/types.ts:55](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/types.ts#L55)

Human-readable indicator of how recent the underlying data is.

***

### dataQualityWarnings

> **dataQualityWarnings**: `string`[]

Defined in: [tools/shared/types.ts:70](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/types.ts#L70)

Explicit warnings about data quality issues, unavailable metrics,
or limitations that affect the reliability of this analysis.
Empty array when all data is available and reliable.

ISMS Policy: A.8.11 (Data integrity), GDPR Article 5(1)(d) (Accuracy)

***

### methodology

> **methodology**: `string`

Defined in: [tools/shared/types.ts:50](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/types.ts#L50)

Description of the analytical methodology used to produce this output.

***

### sourceAttribution

> **sourceAttribution**: `string`

Defined in: [tools/shared/types.ts:61](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/types.ts#L61)

Attribution string identifying the European Parliament Open Data Portal
data sources used in this analysis.
