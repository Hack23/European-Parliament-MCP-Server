[**European Parliament MCP Server API v1.2.21**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/activities](../README.md) / GetProceduresSchema

# Variable: GetProceduresSchema

> `const` **GetProceduresSchema**: `ZodObject`\<\{ `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `processId`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>

Defined in: [schemas/ep/activities.ts:50](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/activities.ts#L50)

Get procedures input schema.

**EP API /procedures filtering:** The EP API does not support a `year`
parameter — only `process-type` is available.  Callers needing
year-specific counts must filter client-side.
