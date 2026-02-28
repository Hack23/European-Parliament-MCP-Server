[**European Parliament MCP Server API v0.9.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/plenary](../README.md) / GetPlenarySessionsSchema

# Variable: GetPlenarySessionsSchema

> `const` **GetPlenarySessionsSchema**: `ZodObject`\<\{ `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `eventId`: `ZodOptional`\<`ZodString`\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `location`: `ZodOptional`\<`ZodString`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; \}, `$strip`\>

Defined in: [schemas/ep/plenary.ts:13](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/plenary.ts#L13)

Get plenary sessions input schema
