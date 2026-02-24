[**European Parliament MCP Server API v0.6.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [schemas/europeanParliament](../README.md) / ParliamentaryQuestionSchema

# Variable: ParliamentaryQuestionSchema

> `const` **ParliamentaryQuestionSchema**: `ZodObject`\<\{ `answerDate`: `ZodOptional`\<`ZodString`\>; `answerText`: `ZodOptional`\<`ZodString`\>; `author`: `ZodString`; `date`: `ZodString`; `id`: `ZodString`; `questionText`: `ZodString`; `status`: `ZodEnum`\<\{ `ANSWERED`: `"ANSWERED"`; `PENDING`: `"PENDING"`; \}\>; `topic`: `ZodString`; `type`: `ZodEnum`\<\{ `ORAL`: `"ORAL"`; `WRITTEN`: `"WRITTEN"`; \}\>; \}, `$strip`\>

Defined in: [schemas/europeanParliament.ts:355](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/schemas/europeanParliament.ts#L355)

Parliamentary question output schema
