[**European Parliament MCP Server API v0.8.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/analysis](../README.md) / DetectVotingAnomaliesSchema

# Variable: DetectVotingAnomaliesSchema

> `const` **DetectVotingAnomaliesSchema**: `ZodObject`\<\{ `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `groupId`: `ZodOptional`\<`ZodString`\>; `mepId`: `ZodOptional`\<`ZodString`\>; `sensitivityThreshold`: `ZodDefault`\<`ZodNumber`\>; \}, `$strip`\>

Defined in: [schemas/ep/analysis.ts:86](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/schemas/ep/analysis.ts#L86)

Detect voting anomalies input schema
