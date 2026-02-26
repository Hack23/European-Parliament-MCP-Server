[**European Parliament MCP Server API v0.8.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/analysis](../README.md) / DetectVotingAnomaliesSchema

# Variable: DetectVotingAnomaliesSchema

> `const` **DetectVotingAnomaliesSchema**: `ZodObject`\<\{ `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `groupId`: `ZodOptional`\<`ZodString`\>; `mepId`: `ZodOptional`\<`ZodString`\>; `sensitivityThreshold`: `ZodDefault`\<`ZodNumber`\>; \}, `$strip`\>

Defined in: [schemas/ep/analysis.ts:86](https://github.com/Hack23/European-Parliament-MCP-Server/blob/67dbd67a8f5629591a17b9785bfa0977f7023afb/src/schemas/ep/analysis.ts#L86)

Detect voting anomalies input schema
