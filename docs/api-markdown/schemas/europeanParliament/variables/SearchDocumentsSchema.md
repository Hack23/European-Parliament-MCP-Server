[**European Parliament MCP Server API v0.6.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [schemas/europeanParliament](../README.md) / SearchDocumentsSchema

# Variable: SearchDocumentsSchema

> `const` **SearchDocumentsSchema**: `ZodObject`\<\{ `committee`: `ZodOptional`\<`ZodString`\>; `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `docId`: `ZodOptional`\<`ZodString`\>; `documentType`: `ZodOptional`\<`ZodEnum`\<\{ `AMENDMENT`: `"AMENDMENT"`; `DECISION`: `"DECISION"`; `DIRECTIVE`: `"DIRECTIVE"`; `OPINION`: `"OPINION"`; `REGULATION`: `"REGULATION"`; `REPORT`: `"REPORT"`; `RESOLUTION`: `"RESOLUTION"`; \}\>\>; `keyword`: `ZodOptional`\<`ZodString`\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; \}, `$strip`\>

Defined in: [schemas/europeanParliament.ts:225](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/schemas/europeanParliament.ts#L225)

Search documents input schema
