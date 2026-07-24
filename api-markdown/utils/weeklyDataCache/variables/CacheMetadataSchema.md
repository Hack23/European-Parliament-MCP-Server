[**European Parliament MCP Server API v1.4.5**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/weeklyDataCache](../README.md) / CacheMetadataSchema

# Variable: CacheMetadataSchema

> `const` **CacheMetadataSchema**: `ZodObject`\<\{ `complete`: `ZodOptional`\<`ZodBoolean`\>; `dataset`: `ZodOptional`\<`ZodEnum`\<\{ `controlled-vocabularies`: `"controlled-vocabularies"`; `corporate-bodies`: `"corporate-bodies"`; `meps`: `"meps"`; \}\>\>; `detailCount`: `ZodOptional`\<`ZodNumber`\>; `generatedAt`: `ZodString`; `recordCount`: `ZodOptional`\<`ZodNumber`\>; `schemaVersion`: `ZodNumber`; `scope`: `ZodOptional`\<`ZodEnum`\<\{ `all`: `"all"`; `current`: `"current"`; \}\>\>; `source`: `ZodString`; `weekKey`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>

Defined in: [utils/weeklyDataCache.ts:12](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/weeklyDataCache.ts#L12)
