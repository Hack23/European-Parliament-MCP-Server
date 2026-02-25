[**European Parliament MCP Server API v0.8.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/question](../README.md) / GetParliamentaryQuestionsSchema

# Variable: GetParliamentaryQuestionsSchema

> `const` **GetParliamentaryQuestionsSchema**: `ZodObject`\<\{ `author`: `ZodOptional`\<`ZodString`\>; `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `docId`: `ZodOptional`\<`ZodString`\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `status`: `ZodOptional`\<`ZodEnum`\<\{ `ANSWERED`: `"ANSWERED"`; `PENDING`: `"PENDING"`; \}\>\>; `topic`: `ZodOptional`\<`ZodString`\>; `type`: `ZodOptional`\<`ZodEnum`\<\{ `ORAL`: `"ORAL"`; `WRITTEN`: `"WRITTEN"`; \}\>\>; \}, `$strip`\>

Defined in: [schemas/ep/question.ts:13](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/schemas/ep/question.ts#L13)

Get parliamentary questions input schema
