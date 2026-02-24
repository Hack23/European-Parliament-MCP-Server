[**European Parliament MCP Server API v0.7.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/analysis](../README.md) / AnalyzeLegislativeEffectivenessSchema

# Variable: AnalyzeLegislativeEffectivenessSchema

> `const` **AnalyzeLegislativeEffectivenessSchema**: `ZodObject`\<\{ `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `subjectId`: `ZodString`; `subjectType`: `ZodEnum`\<\{ `COMMITTEE`: `"COMMITTEE"`; `MEP`: `"MEP"`; \}\>; \}, `$strip`\>

Defined in: [schemas/ep/analysis.ts:132](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/schemas/ep/analysis.ts#L132)

Analyze legislative effectiveness input schema
