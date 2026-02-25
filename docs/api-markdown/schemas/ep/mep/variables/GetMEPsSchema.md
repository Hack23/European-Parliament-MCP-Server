[**European Parliament MCP Server API v0.8.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/mep](../README.md) / GetMEPsSchema

# Variable: GetMEPsSchema

> `const` **GetMEPsSchema**: `ZodObject`\<\{ `active`: `ZodDefault`\<`ZodBoolean`\>; `committee`: `ZodOptional`\<`ZodString`\>; `country`: `ZodOptional`\<`ZodString`\>; `group`: `ZodOptional`\<`ZodString`\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; \}, `$strip`\>

Defined in: [schemas/ep/mep.ts:13](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/schemas/ep/mep.ts#L13)

Get MEPs input schema
