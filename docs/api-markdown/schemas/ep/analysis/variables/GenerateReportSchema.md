[**European Parliament MCP Server API v0.8.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/analysis](../README.md) / GenerateReportSchema

# Variable: GenerateReportSchema

> `const` **GenerateReportSchema**: `ZodObject`\<\{ `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `reportType`: `ZodEnum`\<\{ `COMMITTEE_PERFORMANCE`: `"COMMITTEE_PERFORMANCE"`; `LEGISLATION_PROGRESS`: `"LEGISLATION_PROGRESS"`; `MEP_ACTIVITY`: `"MEP_ACTIVITY"`; `VOTING_STATISTICS`: `"VOTING_STATISTICS"`; \}\>; `subjectId`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>

Defined in: [schemas/ep/analysis.ts:38](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/schemas/ep/analysis.ts#L38)

Generate report input schema
