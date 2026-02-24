[**European Parliament MCP Server API v0.7.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/mep](../README.md) / MEPSchema

# Variable: MEPSchema

> `const` **MEPSchema**: `ZodObject`\<\{ `active`: `ZodBoolean`; `committees`: `ZodArray`\<`ZodString`\>; `country`: `ZodString`; `email`: `ZodOptional`\<`ZodString`\>; `id`: `ZodString`; `name`: `ZodString`; `politicalGroup`: `ZodString`; `termEnd`: `ZodOptional`\<`ZodString`\>; `termStart`: `ZodString`; \}, `$strip`\>

Defined in: [schemas/ep/mep.ts:54](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/schemas/ep/mep.ts#L54)

MEP output schema
