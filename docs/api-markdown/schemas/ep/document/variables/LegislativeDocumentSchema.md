[**European Parliament MCP Server API v0.7.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/document](../README.md) / LegislativeDocumentSchema

# Variable: LegislativeDocumentSchema

> `const` **LegislativeDocumentSchema**: `ZodObject`\<\{ `authors`: `ZodArray`\<`ZodString`\>; `committee`: `ZodOptional`\<`ZodString`\>; `date`: `ZodString`; `id`: `ZodString`; `pdfUrl`: `ZodOptional`\<`ZodString`\>; `status`: `ZodEnum`\<\{ `ADOPTED`: `"ADOPTED"`; `DRAFT`: `"DRAFT"`; `IN_COMMITTEE`: `"IN_COMMITTEE"`; `PLENARY`: `"PLENARY"`; `REJECTED`: `"REJECTED"`; `SUBMITTED`: `"SUBMITTED"`; \}\>; `summary`: `ZodOptional`\<`ZodString`\>; `title`: `ZodString`; `type`: `ZodEnum`\<\{ `AMENDMENT`: `"AMENDMENT"`; `DECISION`: `"DECISION"`; `DIRECTIVE`: `"DIRECTIVE"`; `OPINION`: `"OPINION"`; `REGULATION`: `"REGULATION"`; `REPORT`: `"REPORT"`; `RESOLUTION`: `"RESOLUTION"`; \}\>; `xmlUrl`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>

Defined in: [schemas/ep/document.ts:65](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/schemas/ep/document.ts#L65)

Legislative document output schema
