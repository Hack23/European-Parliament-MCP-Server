[**European Parliament MCP Server API v0.7.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [schemas/europeanParliament](../README.md) / GetParliamentaryQuestionsSchema

# Variable: GetParliamentaryQuestionsSchema

> `const` **GetParliamentaryQuestionsSchema**: `ZodObject`\<\{ `author`: `ZodOptional`\<`ZodString`\>; `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `docId`: `ZodOptional`\<`ZodString`\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `status`: `ZodOptional`\<`ZodEnum`\<\{ `ANSWERED`: `"ANSWERED"`; `PENDING`: `"PENDING"`; \}\>\>; `topic`: `ZodOptional`\<`ZodString`\>; `type`: `ZodOptional`\<`ZodEnum`\<\{ `ORAL`: `"ORAL"`; `WRITTEN`: `"WRITTEN"`; \}\>\>; \}, `$strip`\>

Defined in: [schemas/europeanParliament.ts:315](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/schemas/europeanParliament.ts#L315)

Get parliamentary questions input schema
