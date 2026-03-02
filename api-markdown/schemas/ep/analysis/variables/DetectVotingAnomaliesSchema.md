[**European Parliament MCP Server API v1.1.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/analysis](../README.md) / DetectVotingAnomaliesSchema

# Variable: DetectVotingAnomaliesSchema

> `const` **DetectVotingAnomaliesSchema**: `ZodObject`\<\{ `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `groupId`: `ZodOptional`\<`ZodString`\>; `mepId`: `ZodOptional`\<`ZodString`\>; `sensitivityThreshold`: `ZodDefault`\<`ZodNumber`\>; \}, `$strip`\>

Defined in: [schemas/ep/analysis.ts:86](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/analysis.ts#L86)

Detect voting anomalies input schema
