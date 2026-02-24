[**European Parliament MCP Server API v0.7.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [schemas/europeanParliament](../README.md) / MonitorLegislativePipelineSchema

# Variable: MonitorLegislativePipelineSchema

> `const` **MonitorLegislativePipelineSchema**: `ZodObject`\<\{ `committee`: `ZodOptional`\<`ZodString`\>; `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `status`: `ZodDefault`\<`ZodEnum`\<\{ `ACTIVE`: `"ACTIVE"`; `ALL`: `"ALL"`; `COMPLETED`: `"COMPLETED"`; `STALLED`: `"STALLED"`; \}\>\>; \}, `$strip`\>

Defined in: [schemas/europeanParliament.ts:507](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/schemas/europeanParliament.ts#L507)

Monitor legislative pipeline input schema
