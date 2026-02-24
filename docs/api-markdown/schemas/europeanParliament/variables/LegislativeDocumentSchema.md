[**European Parliament MCP Server API v0.7.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [schemas/europeanParliament](../README.md) / LegislativeDocumentSchema

# Variable: LegislativeDocumentSchema

> `const` **LegislativeDocumentSchema**: `ZodObject`\<\{ `authors`: `ZodArray`\<`ZodString`\>; `committee`: `ZodOptional`\<`ZodString`\>; `date`: `ZodString`; `id`: `ZodString`; `pdfUrl`: `ZodOptional`\<`ZodString`\>; `status`: `ZodEnum`\<\{ `ADOPTED`: `"ADOPTED"`; `DRAFT`: `"DRAFT"`; `IN_COMMITTEE`: `"IN_COMMITTEE"`; `PLENARY`: `"PLENARY"`; `REJECTED`: `"REJECTED"`; `SUBMITTED`: `"SUBMITTED"`; \}\>; `summary`: `ZodOptional`\<`ZodString`\>; `title`: `ZodString`; `type`: `ZodEnum`\<\{ `AMENDMENT`: `"AMENDMENT"`; `DECISION`: `"DECISION"`; `DIRECTIVE`: `"DIRECTIVE"`; `OPINION`: `"OPINION"`; `REGULATION`: `"REGULATION"`; `REPORT`: `"REPORT"`; `RESOLUTION`: `"RESOLUTION"`; \}\>; `xmlUrl`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>

Defined in: [schemas/europeanParliament.ts:263](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/schemas/europeanParliament.ts#L263)

Legislative document output schema
