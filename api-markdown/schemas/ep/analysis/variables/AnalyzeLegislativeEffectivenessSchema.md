[**European Parliament MCP Server API v0.7.3**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/analysis](../README.md) / AnalyzeLegislativeEffectivenessSchema

# Variable: AnalyzeLegislativeEffectivenessSchema

> `const` **AnalyzeLegislativeEffectivenessSchema**: `ZodObject`\<\{ `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `subjectId`: `ZodString`; `subjectType`: `ZodEnum`\<\{ `COMMITTEE`: `"COMMITTEE"`; `MEP`: `"MEP"`; \}\>; \}, `$strip`\>

Defined in: [schemas/ep/analysis.ts:132](https://github.com/Hack23/European-Parliament-MCP-Server/blob/c844f163befb571516b5718c5d197eff1e589dea/src/schemas/ep/analysis.ts#L132)

Analyze legislative effectiveness input schema
