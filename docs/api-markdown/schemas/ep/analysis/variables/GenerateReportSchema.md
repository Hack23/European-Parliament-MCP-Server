[**European Parliament MCP Server API v0.7.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/analysis](../README.md) / GenerateReportSchema

# Variable: GenerateReportSchema

> `const` **GenerateReportSchema**: `ZodObject`\<\{ `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `reportType`: `ZodEnum`\<\{ `COMMITTEE_PERFORMANCE`: `"COMMITTEE_PERFORMANCE"`; `LEGISLATION_PROGRESS`: `"LEGISLATION_PROGRESS"`; `MEP_ACTIVITY`: `"MEP_ACTIVITY"`; `VOTING_STATISTICS`: `"VOTING_STATISTICS"`; \}\>; `subjectId`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>

Defined in: [schemas/ep/analysis.ts:38](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/schemas/ep/analysis.ts#L38)

Generate report input schema
