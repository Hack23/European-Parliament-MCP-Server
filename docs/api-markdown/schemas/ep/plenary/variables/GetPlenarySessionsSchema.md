[**European Parliament MCP Server API v0.7.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/plenary](../README.md) / GetPlenarySessionsSchema

# Variable: GetPlenarySessionsSchema

> `const` **GetPlenarySessionsSchema**: `ZodObject`\<\{ `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `eventId`: `ZodOptional`\<`ZodString`\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `location`: `ZodOptional`\<`ZodString`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; \}, `$strip`\>

Defined in: [schemas/ep/plenary.ts:13](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/schemas/ep/plenary.ts#L13)

Get plenary sessions input schema
