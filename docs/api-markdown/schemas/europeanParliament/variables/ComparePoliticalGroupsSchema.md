[**European Parliament MCP Server API v0.7.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [schemas/europeanParliament](../README.md) / ComparePoliticalGroupsSchema

# Variable: ComparePoliticalGroupsSchema

> `const` **ComparePoliticalGroupsSchema**: `ZodObject`\<\{ `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `dimensions`: `ZodOptional`\<`ZodArray`\<`ZodEnum`\<\{ `activity_level`: `"activity_level"`; `attendance`: `"attendance"`; `cohesion`: `"cohesion"`; `legislative_output`: `"legislative_output"`; `voting_discipline`: `"voting_discipline"`; \}\>\>\>; `groupIds`: `ZodArray`\<`ZodString`\>; \}, `$strip`\>

Defined in: [schemas/europeanParliament.ts:473](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/schemas/europeanParliament.ts#L473)

Compare political groups input schema
