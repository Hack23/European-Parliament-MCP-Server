[**European Parliament MCP Server API v1.0.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/document](../README.md) / LegislativeDocumentSchema

# Variable: LegislativeDocumentSchema

> `const` **LegislativeDocumentSchema**: `ZodObject`\<\{ `authors`: `ZodArray`\<`ZodString`\>; `committee`: `ZodOptional`\<`ZodString`\>; `date`: `ZodString`; `id`: `ZodString`; `pdfUrl`: `ZodOptional`\<`ZodString`\>; `status`: `ZodEnum`\<\{ `ADOPTED`: `"ADOPTED"`; `DRAFT`: `"DRAFT"`; `IN_COMMITTEE`: `"IN_COMMITTEE"`; `PLENARY`: `"PLENARY"`; `REJECTED`: `"REJECTED"`; `SUBMITTED`: `"SUBMITTED"`; \}\>; `summary`: `ZodOptional`\<`ZodString`\>; `title`: `ZodString`; `type`: `ZodEnum`\<\{ `AMENDMENT`: `"AMENDMENT"`; `DECISION`: `"DECISION"`; `DIRECTIVE`: `"DIRECTIVE"`; `OPINION`: `"OPINION"`; `REGULATION`: `"REGULATION"`; `REPORT`: `"REPORT"`; `RESOLUTION`: `"RESOLUTION"`; \}\>; `xmlUrl`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>

Defined in: [schemas/ep/document.ts:65](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/document.ts#L65)

Legislative document output schema
