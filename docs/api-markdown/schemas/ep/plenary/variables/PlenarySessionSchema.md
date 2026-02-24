[**European Parliament MCP Server API v0.7.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/plenary](../README.md) / PlenarySessionSchema

# Variable: PlenarySessionSchema

> `const` **PlenarySessionSchema**: `ZodObject`\<\{ `agendaItems`: `ZodArray`\<`ZodString`\>; `attendanceCount`: `ZodOptional`\<`ZodNumber`\>; `date`: `ZodString`; `documents`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `id`: `ZodString`; `location`: `ZodString`; `votingRecords`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; \}, `$strip`\>

Defined in: [schemas/ep/plenary.ts:42](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/schemas/ep/plenary.ts#L42)

Plenary session output schema
