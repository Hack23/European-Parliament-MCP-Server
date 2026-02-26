[**European Parliament MCP Server API v0.8.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/question](../README.md) / ParliamentaryQuestionSchema

# Variable: ParliamentaryQuestionSchema

> `const` **ParliamentaryQuestionSchema**: `ZodObject`\<\{ `answerDate`: `ZodOptional`\<`ZodString`\>; `answerText`: `ZodOptional`\<`ZodString`\>; `author`: `ZodString`; `date`: `ZodString`; `id`: `ZodString`; `questionText`: `ZodString`; `status`: `ZodEnum`\<\{ `ANSWERED`: `"ANSWERED"`; `PENDING`: `"PENDING"`; \}\>; `topic`: `ZodString`; `type`: `ZodEnum`\<\{ `ORAL`: `"ORAL"`; `WRITTEN`: `"WRITTEN"`; \}\>; \}, `$strip`\>

Defined in: [schemas/ep/question.ts:53](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/schemas/ep/question.ts#L53)

Parliamentary question output schema
