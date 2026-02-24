[**European Parliament MCP Server API v0.7.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/common](../README.md) / PaginatedResponseSchema

# Function: PaginatedResponseSchema()

> **PaginatedResponseSchema**\<`T`\>(`dataSchema`): `ZodObject`\<\{ `data`: `ZodArray`\<`T`\>; `hasMore`: `ZodBoolean`; `limit`: `ZodNumber`; `offset`: `ZodNumber`; `total`: `ZodNumber`; \}\>

Defined in: [schemas/ep/common.ts:27](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/schemas/ep/common.ts#L27)

Paginated response schema factory

## Type Parameters

### T

`T` *extends* `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

## Parameters

### dataSchema

`T`

## Returns

`ZodObject`\<\{ `data`: `ZodArray`\<`T`\>; `hasMore`: `ZodBoolean`; `limit`: `ZodNumber`; `offset`: `ZodNumber`; `total`: `ZodNumber`; \}\>
