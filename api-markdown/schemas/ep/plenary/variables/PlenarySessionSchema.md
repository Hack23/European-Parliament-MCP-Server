[**European Parliament MCP Server API v1.1.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/plenary](../README.md) / PlenarySessionSchema

# Variable: PlenarySessionSchema

> `const` **PlenarySessionSchema**: `ZodObject`\<\{ `agendaItems`: `ZodArray`\<`ZodString`\>; `attendanceCount`: `ZodOptional`\<`ZodNumber`\>; `date`: `ZodString`; `documents`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `id`: `ZodString`; `location`: `ZodString`; `votingRecords`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; \}, `$strip`\>

Defined in: [schemas/ep/plenary.ts:48](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/plenary.ts#L48)

Plenary session output schema
