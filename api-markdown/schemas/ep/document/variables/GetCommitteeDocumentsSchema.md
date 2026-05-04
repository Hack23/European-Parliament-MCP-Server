[**European Parliament MCP Server API v1.2.21**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/document](../README.md) / GetCommitteeDocumentsSchema

# Variable: GetCommitteeDocumentsSchema

> `const` **GetCommitteeDocumentsSchema**: `ZodObject`\<\{ `docId`: `ZodOptional`\<`ZodString`\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; \}, `$strip`\>

Defined in: [schemas/ep/document.ts:120](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/document.ts#L120)

Get committee documents input schema.

**EP API /committee-documents filtering:** The EP API does not support
a `year` parameter for this endpoint.  Only pagination is available.
