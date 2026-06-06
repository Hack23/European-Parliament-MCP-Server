[**European Parliament MCP Server API v1.3.16**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getAllGeneratedStats](../README.md) / GetAllGeneratedStatsSchema

# Variable: GetAllGeneratedStatsSchema

> `const` **GetAllGeneratedStatsSchema**: `ZodObject`\<[`GetAllGeneratedStatsParams`](../type-aliases/GetAllGeneratedStatsParams.md)\>

Defined in: [tools/getAllGeneratedStats.ts:46](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getAllGeneratedStats.ts#L46)

Zod input schema for the `get_all_generated_stats` MCP tool. Filters
the dataset by year range (2004-2031) and activity category, and
controls inclusion of predictions, monthly breakdowns and rankings.
