[**European Parliament MCP Server API v0.8.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/analysis](../README.md) / AnalyzeLegislativeEffectivenessSchema

# Variable: AnalyzeLegislativeEffectivenessSchema

> `const` **AnalyzeLegislativeEffectivenessSchema**: `ZodObject`\<\{ `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `subjectId`: `ZodString`; `subjectType`: `ZodEnum`\<\{ `COMMITTEE`: `"COMMITTEE"`; `MEP`: `"MEP"`; \}\>; \}, `$strip`\>

Defined in: [schemas/ep/analysis.ts:132](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/schemas/ep/analysis.ts#L132)

Analyze legislative effectiveness input schema
