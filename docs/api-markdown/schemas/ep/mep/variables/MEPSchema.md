[**European Parliament MCP Server API v0.9.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/mep](../README.md) / MEPSchema

# Variable: MEPSchema

> `const` **MEPSchema**: `ZodObject`\<\{ `active`: `ZodBoolean`; `committees`: `ZodArray`\<`ZodString`\>; `country`: `ZodString`; `email`: `ZodOptional`\<`ZodString`\>; `id`: `ZodString`; `name`: `ZodString`; `politicalGroup`: `ZodString`; `termEnd`: `ZodOptional`\<`ZodString`\>; `termStart`: `ZodString`; \}, `$strip`\>

Defined in: [schemas/ep/mep.ts:54](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/mep.ts#L54)

MEP output schema
