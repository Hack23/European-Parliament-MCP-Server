[**European Parliament MCP Server API v0.8.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/analysis](../README.md) / ComparePoliticalGroupsSchema

# Variable: ComparePoliticalGroupsSchema

> `const` **ComparePoliticalGroupsSchema**: `ZodObject`\<\{ `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `dimensions`: `ZodOptional`\<`ZodArray`\<`ZodEnum`\<\{ `activity_level`: `"activity_level"`; `attendance`: `"attendance"`; `cohesion`: `"cohesion"`; `legislative_output`: `"legislative_output"`; `voting_discipline`: `"voting_discipline"`; \}\>\>\>; `groupIds`: `ZodArray`\<`ZodString`\>; \}, `$strip`\>

Defined in: [schemas/ep/analysis.ts:112](https://github.com/Hack23/European-Parliament-MCP-Server/blob/67dbd67a8f5629591a17b9785bfa0977f7023afb/src/schemas/ep/analysis.ts#L112)

Compare political groups input schema
