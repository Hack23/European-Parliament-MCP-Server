[**European Parliament MCP Server API v1.2.14**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/analysis](../README.md) / CorrelateIntelligenceSchema

# Variable: CorrelateIntelligenceSchema

> `const` **CorrelateIntelligenceSchema**: `ZodObject`\<\{ `groups`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `includeNetworkAnalysis`: `ZodDefault`\<`ZodBoolean`\>; `mepIds`: `ZodArray`\<`ZodString`\>; `sensitivityLevel`: `ZodDefault`\<`ZodEnum`\<\{ `HIGH`: `"HIGH"`; `LOW`: `"LOW"`; `MEDIUM`: `"MEDIUM"`; \}\>\>; \}, `$strip`\>

Defined in: [schemas/ep/analysis.ts:214](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/analysis.ts#L214)

Cross-tool intelligence correlation input schema.

Accepts 1-5 MEP identifiers for per-MEP correlations (influence × anomaly,
network × committee) and optional political group identifiers for
coalition-level analysis (early warning × coalition dynamics).
