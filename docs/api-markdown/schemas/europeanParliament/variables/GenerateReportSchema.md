[**European Parliament MCP Server API v0.6.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [schemas/europeanParliament](../README.md) / GenerateReportSchema

# Variable: GenerateReportSchema

> `const` **GenerateReportSchema**: `ZodObject`\<\{ `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `reportType`: `ZodEnum`\<\{ `COMMITTEE_PERFORMANCE`: `"COMMITTEE_PERFORMANCE"`; `LEGISLATION_PROGRESS`: `"LEGISLATION_PROGRESS"`; `MEP_ACTIVITY`: `"MEP_ACTIVITY"`; `VOTING_STATISTICS`: `"VOTING_STATISTICS"`; \}\>; `subjectId`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>

Defined in: [schemas/europeanParliament.ts:395](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/schemas/europeanParliament.ts#L395)

Generate report input schema
