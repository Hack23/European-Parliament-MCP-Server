[**European Parliament MCP Server API v0.7.3**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/plenary](../README.md) / PlenarySessionSchema

# Variable: PlenarySessionSchema

> `const` **PlenarySessionSchema**: `ZodObject`\<\{ `agendaItems`: `ZodArray`\<`ZodString`\>; `attendanceCount`: `ZodOptional`\<`ZodNumber`\>; `date`: `ZodString`; `documents`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `id`: `ZodString`; `location`: `ZodString`; `votingRecords`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; \}, `$strip`\>

Defined in: [schemas/ep/plenary.ts:42](https://github.com/Hack23/European-Parliament-MCP-Server/blob/c844f163befb571516b5718c5d197eff1e589dea/src/schemas/ep/plenary.ts#L42)

Plenary session output schema
