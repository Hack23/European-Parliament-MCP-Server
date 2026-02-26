[**European Parliament MCP Server API v0.8.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/mep](../README.md) / MEPSchema

# Variable: MEPSchema

> `const` **MEPSchema**: `ZodObject`\<\{ `active`: `ZodBoolean`; `committees`: `ZodArray`\<`ZodString`\>; `country`: `ZodString`; `email`: `ZodOptional`\<`ZodString`\>; `id`: `ZodString`; `name`: `ZodString`; `politicalGroup`: `ZodString`; `termEnd`: `ZodOptional`\<`ZodString`\>; `termStart`: `ZodString`; \}, `$strip`\>

Defined in: [schemas/ep/mep.ts:54](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/schemas/ep/mep.ts#L54)

MEP output schema
