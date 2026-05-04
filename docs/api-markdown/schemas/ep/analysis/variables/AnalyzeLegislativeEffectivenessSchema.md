[**European Parliament MCP Server API v1.2.21**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/analysis](../README.md) / AnalyzeLegislativeEffectivenessSchema

# Variable: AnalyzeLegislativeEffectivenessSchema

> `const` **AnalyzeLegislativeEffectivenessSchema**: `ZodObject`\<\{ `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `subjectId`: `ZodString`; `subjectType`: `ZodEnum`\<\{ `COMMITTEE`: `"COMMITTEE"`; `MEP`: `"MEP"`; \}\>; \}, `$strip`\>

Defined in: [schemas/ep/analysis.ts:144](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/analysis.ts#L144)

Analyze legislative effectiveness input schema
