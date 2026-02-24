[**European Parliament MCP Server API v0.6.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [schemas/europeanParliament](../README.md) / PaginatedResponseSchema

# Function: PaginatedResponseSchema()

> **PaginatedResponseSchema**\<`T`\>(`dataSchema`): `ZodObject`\<\{ `data`: `ZodArray`\<`T`\>; `hasMore`: `ZodBoolean`; `limit`: `ZodNumber`; `offset`: `ZodNumber`; `total`: `ZodNumber`; \}\>

Defined in: [schemas/europeanParliament.ts:529](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/schemas/europeanParliament.ts#L529)

Paginated response schema

## Type Parameters

### T

`T` *extends* `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

## Parameters

### dataSchema

`T`

## Returns

`ZodObject`\<\{ `data`: `ZodArray`\<`T`\>; `hasMore`: `ZodBoolean`; `limit`: `ZodNumber`; `offset`: `ZodNumber`; `total`: `ZodNumber`; \}\>
