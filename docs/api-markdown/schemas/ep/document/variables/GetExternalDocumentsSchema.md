[**European Parliament MCP Server API v1.2.15**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/document](../README.md) / GetExternalDocumentsSchema

# Variable: GetExternalDocumentsSchema

> `const` **GetExternalDocumentsSchema**: `ZodObject`\<\{ `docId`: `ZodOptional`\<`ZodString`\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; \}, `$strip`\>

Defined in: [schemas/ep/document.ts:184](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/document.ts#L184)

Get external documents input schema.

**EP API /external-documents filtering:** The EP API does not support
a `year` parameter for this endpoint.  Only pagination is available.
