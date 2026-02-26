[**European Parliament MCP Server API v0.8.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/mep](../README.md) / GetMEPsSchema

# Variable: GetMEPsSchema

> `const` **GetMEPsSchema**: `ZodObject`\<\{ `active`: `ZodDefault`\<`ZodBoolean`\>; `committee`: `ZodOptional`\<`ZodString`\>; `country`: `ZodOptional`\<`ZodString`\>; `group`: `ZodOptional`\<`ZodString`\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; \}, `$strip`\>

Defined in: [schemas/ep/mep.ts:13](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/schemas/ep/mep.ts#L13)

Get MEPs input schema
