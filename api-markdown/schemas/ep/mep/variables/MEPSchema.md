[**European Parliament MCP Server API v1.2.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/mep](../README.md) / MEPSchema

# Variable: MEPSchema

> `const` **MEPSchema**: `ZodObject`\<\{ `active`: `ZodBoolean`; `committees`: `ZodArray`\<`ZodString`\>; `country`: `ZodString`; `email`: `ZodOptional`\<`ZodEmail`\>; `id`: `ZodString`; `name`: `ZodString`; `politicalGroup`: `ZodString`; `termEnd`: `ZodOptional`\<`ZodString`\>; `termStart`: `ZodString`; \}, `$strip`\>

Defined in: [schemas/ep/mep.ts:52](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/mep.ts#L52)

MEP output schema
