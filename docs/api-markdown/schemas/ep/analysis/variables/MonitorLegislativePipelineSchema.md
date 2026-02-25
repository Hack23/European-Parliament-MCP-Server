[**European Parliament MCP Server API v0.8.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/analysis](../README.md) / MonitorLegislativePipelineSchema

# Variable: MonitorLegislativePipelineSchema

> `const` **MonitorLegislativePipelineSchema**: `ZodObject`\<\{ `committee`: `ZodOptional`\<`ZodString`\>; `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `status`: `ZodDefault`\<`ZodEnum`\<\{ `ACTIVE`: `"ACTIVE"`; `ALL`: `"ALL"`; `COMPLETED`: `"COMPLETED"`; `STALLED`: `"STALLED"`; \}\>\>; \}, `$strip`\>

Defined in: [schemas/ep/analysis.ts:146](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/schemas/ep/analysis.ts#L146)

Monitor legislative pipeline input schema
