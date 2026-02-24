[**European Parliament MCP Server API v0.7.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [schemas/europeanParliament](../README.md) / PlenarySessionSchema

# Variable: PlenarySessionSchema

> `const` **PlenarySessionSchema**: `ZodObject`\<\{ `agendaItems`: `ZodArray`\<`ZodString`\>; `attendanceCount`: `ZodOptional`\<`ZodNumber`\>; `date`: `ZodString`; `documents`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `id`: `ZodString`; `location`: `ZodString`; `votingRecords`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; \}, `$strip`\>

Defined in: [schemas/europeanParliament.ts:149](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/schemas/europeanParliament.ts#L149)

Plenary session output schema
