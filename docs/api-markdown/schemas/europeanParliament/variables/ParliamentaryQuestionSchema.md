[**European Parliament MCP Server API v0.7.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [schemas/europeanParliament](../README.md) / ParliamentaryQuestionSchema

# Variable: ParliamentaryQuestionSchema

> `const` **ParliamentaryQuestionSchema**: `ZodObject`\<\{ `answerDate`: `ZodOptional`\<`ZodString`\>; `answerText`: `ZodOptional`\<`ZodString`\>; `author`: `ZodString`; `date`: `ZodString`; `id`: `ZodString`; `questionText`: `ZodString`; `status`: `ZodEnum`\<\{ `ANSWERED`: `"ANSWERED"`; `PENDING`: `"PENDING"`; \}\>; `topic`: `ZodString`; `type`: `ZodEnum`\<\{ `ORAL`: `"ORAL"`; `WRITTEN`: `"WRITTEN"`; \}\>; \}, `$strip`\>

Defined in: [schemas/europeanParliament.ts:355](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/schemas/europeanParliament.ts#L355)

Parliamentary question output schema
