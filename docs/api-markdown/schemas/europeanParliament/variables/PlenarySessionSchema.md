[**European Parliament MCP Server API v0.6.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [schemas/europeanParliament](../README.md) / PlenarySessionSchema

# Variable: PlenarySessionSchema

> `const` **PlenarySessionSchema**: `ZodObject`\<\{ `agendaItems`: `ZodArray`\<`ZodString`\>; `attendanceCount`: `ZodOptional`\<`ZodNumber`\>; `date`: `ZodString`; `documents`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `id`: `ZodString`; `location`: `ZodString`; `votingRecords`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; \}, `$strip`\>

Defined in: [schemas/europeanParliament.ts:149](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/schemas/europeanParliament.ts#L149)

Plenary session output schema
