[**European Parliament MCP Server API v0.7.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/analysis](../README.md) / ComparePoliticalGroupsSchema

# Variable: ComparePoliticalGroupsSchema

> `const` **ComparePoliticalGroupsSchema**: `ZodObject`\<\{ `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `dimensions`: `ZodOptional`\<`ZodArray`\<`ZodEnum`\<\{ `activity_level`: `"activity_level"`; `attendance`: `"attendance"`; `cohesion`: `"cohesion"`; `legislative_output`: `"legislative_output"`; `voting_discipline`: `"voting_discipline"`; \}\>\>\>; `groupIds`: `ZodArray`\<`ZodString`\>; \}, `$strip`\>

Defined in: [schemas/ep/analysis.ts:112](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/schemas/ep/analysis.ts#L112)

Compare political groups input schema
