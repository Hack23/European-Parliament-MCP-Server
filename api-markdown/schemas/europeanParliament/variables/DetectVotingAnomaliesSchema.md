[**European Parliament MCP Server API v0.7.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [schemas/europeanParliament](../README.md) / DetectVotingAnomaliesSchema

# Variable: DetectVotingAnomaliesSchema

> `const` **DetectVotingAnomaliesSchema**: `ZodObject`\<\{ `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `groupId`: `ZodOptional`\<`ZodString`\>; `mepId`: `ZodOptional`\<`ZodString`\>; `sensitivityThreshold`: `ZodDefault`\<`ZodNumber`\>; \}, `$strip`\>

Defined in: [schemas/europeanParliament.ts:447](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/schemas/europeanParliament.ts#L447)

Detect voting anomalies input schema
