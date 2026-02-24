[**European Parliament MCP Server API v0.7.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [schemas/europeanParliament](../README.md) / PaginatedResponseSchema

# Function: PaginatedResponseSchema()

> **PaginatedResponseSchema**\<`T`\>(`dataSchema`): `ZodObject`\<\{ `data`: `ZodArray`\<`T`\>; `hasMore`: `ZodBoolean`; `limit`: `ZodNumber`; `offset`: `ZodNumber`; `total`: `ZodNumber`; \}\>

Defined in: [schemas/europeanParliament.ts:529](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/schemas/europeanParliament.ts#L529)

Paginated response schema

## Type Parameters

### T

`T` *extends* `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

## Parameters

### dataSchema

`T`

## Returns

`ZodObject`\<\{ `data`: `ZodArray`\<`T`\>; `hasMore`: `ZodBoolean`; `limit`: `ZodNumber`; `offset`: `ZodNumber`; `total`: `ZodNumber`; \}\>
