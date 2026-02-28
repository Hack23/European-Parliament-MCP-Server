[**European Parliament MCP Server API v0.9.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/common](../README.md) / PaginatedResponseSchema

# Function: PaginatedResponseSchema()

> **PaginatedResponseSchema**\<`T`\>(`dataSchema`): `ZodObject`\<\{ `data`: `ZodArray`\<`T`\>; `hasMore`: `ZodBoolean`; `limit`: `ZodNumber`; `offset`: `ZodNumber`; `total`: `ZodNumber`; \}\>

Defined in: [schemas/ep/common.ts:27](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/common.ts#L27)

Paginated response schema factory

## Type Parameters

### T

`T` *extends* `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

## Parameters

### dataSchema

`T`

## Returns

`ZodObject`\<\{ `data`: `ZodArray`\<`T`\>; `hasMore`: `ZodBoolean`; `limit`: `ZodNumber`; `offset`: `ZodNumber`; `total`: `ZodNumber`; \}\>
