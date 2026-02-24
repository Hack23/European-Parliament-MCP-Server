[**European Parliament MCP Server API v0.7.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/analysis](../README.md) / MonitorLegislativePipelineSchema

# Variable: MonitorLegislativePipelineSchema

> `const` **MonitorLegislativePipelineSchema**: `ZodObject`\<\{ `committee`: `ZodOptional`\<`ZodString`\>; `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `status`: `ZodDefault`\<`ZodEnum`\<\{ `ACTIVE`: `"ACTIVE"`; `ALL`: `"ALL"`; `COMPLETED`: `"COMPLETED"`; `STALLED`: `"STALLED"`; \}\>\>; \}, `$strip`\>

Defined in: [schemas/ep/analysis.ts:146](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/schemas/ep/analysis.ts#L146)

Monitor legislative pipeline input schema
