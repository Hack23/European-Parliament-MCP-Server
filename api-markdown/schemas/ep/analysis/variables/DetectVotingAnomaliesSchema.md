[**European Parliament MCP Server API v0.7.3**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/analysis](../README.md) / DetectVotingAnomaliesSchema

# Variable: DetectVotingAnomaliesSchema

> `const` **DetectVotingAnomaliesSchema**: `ZodObject`\<\{ `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `groupId`: `ZodOptional`\<`ZodString`\>; `mepId`: `ZodOptional`\<`ZodString`\>; `sensitivityThreshold`: `ZodDefault`\<`ZodNumber`\>; \}, `$strip`\>

Defined in: [schemas/ep/analysis.ts:86](https://github.com/Hack23/European-Parliament-MCP-Server/blob/c844f163befb571516b5718c5d197eff1e589dea/src/schemas/ep/analysis.ts#L86)

Detect voting anomalies input schema
