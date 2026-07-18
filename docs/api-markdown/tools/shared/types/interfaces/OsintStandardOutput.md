[**European Parliament MCP Server API v1.4.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/types](../README.md) / OsintStandardOutput

# Interface: OsintStandardOutput

Defined in: [tools/shared/types.ts:49](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/types.ts#L49)

Standard envelope of OSINT-quality metadata returned alongside the
substantive output of every OSINT-style MCP tool.

Provides callers with a uniform set of trust signals — confidence
level, methodology description, freshness, source attribution, and
known data-quality caveats — so downstream consumers can make
informed decisions about how to use the analysis.

## Extended by

- [`CorrelatedIntelligenceReport`](../../../correlateIntelligence/interfaces/CorrelatedIntelligenceReport.md)

## Properties

### confidenceLevel

> **confidenceLevel**: [`ConfidenceLevel`](../type-aliases/ConfidenceLevel.md)

Defined in: [tools/shared/types.ts:54](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/types.ts#L54)

Confidence level of the analysis: HIGH, MEDIUM, or LOW.
Derived from the volume and quality of underlying data.

***

### dataFreshness

> **dataFreshness**: `string`

Defined in: [tools/shared/types.ts:64](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/types.ts#L64)

Human-readable indicator of how recent the underlying data is.

***

### dataQualityWarnings

> **dataQualityWarnings**: `string`[]

Defined in: [tools/shared/types.ts:79](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/types.ts#L79)

Explicit warnings about data quality issues, unavailable metrics,
or limitations that affect the reliability of this analysis.
Empty array when all data is available and reliable.

ISMS Policy: A.8.11 (Data integrity), GDPR Article 5(1)(d) (Accuracy)

***

### methodology

> **methodology**: `string`

Defined in: [tools/shared/types.ts:59](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/types.ts#L59)

Description of the analytical methodology used to produce this output.

***

### sourceAttribution

> **sourceAttribution**: `string`

Defined in: [tools/shared/types.ts:70](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/types.ts#L70)

Attribution string identifying the European Parliament Open Data Portal
data sources used in this analysis.
