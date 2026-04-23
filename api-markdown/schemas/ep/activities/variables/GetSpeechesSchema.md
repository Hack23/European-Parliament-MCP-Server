[**European Parliament MCP Server API v1.2.12**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/activities](../README.md) / GetSpeechesSchema

# Variable: GetSpeechesSchema

> `const` **GetSpeechesSchema**: `ZodObject`\<\{ `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `speechId`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>

Defined in: [schemas/ep/activities.ts:20](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/activities.ts#L20)

Get speeches input schema.

**EP API /speeches filtering:** The EP API does not support a `year`
parameter.  Use `dateFrom` / `dateTo` (YYYY-MM-DD) which are mapped to
the EP API `sitting-date` / `sitting-date-end` parameters.
