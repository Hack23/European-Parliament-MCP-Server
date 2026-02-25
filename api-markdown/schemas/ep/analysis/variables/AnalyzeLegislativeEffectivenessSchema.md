[**European Parliament MCP Server API v0.8.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/analysis](../README.md) / AnalyzeLegislativeEffectivenessSchema

# Variable: AnalyzeLegislativeEffectivenessSchema

> `const` **AnalyzeLegislativeEffectivenessSchema**: `ZodObject`\<\{ `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `subjectId`: `ZodString`; `subjectType`: `ZodEnum`\<\{ `COMMITTEE`: `"COMMITTEE"`; `MEP`: `"MEP"`; \}\>; \}, `$strip`\>

Defined in: [schemas/ep/analysis.ts:132](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/schemas/ep/analysis.ts#L132)

Analyze legislative effectiveness input schema
