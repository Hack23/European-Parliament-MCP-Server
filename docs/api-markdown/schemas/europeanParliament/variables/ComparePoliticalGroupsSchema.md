[**European Parliament MCP Server API v0.6.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [schemas/europeanParliament](../README.md) / ComparePoliticalGroupsSchema

# Variable: ComparePoliticalGroupsSchema

> `const` **ComparePoliticalGroupsSchema**: `ZodObject`\<\{ `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `dimensions`: `ZodOptional`\<`ZodArray`\<`ZodEnum`\<\{ `activity_level`: `"activity_level"`; `attendance`: `"attendance"`; `cohesion`: `"cohesion"`; `legislative_output`: `"legislative_output"`; `voting_discipline`: `"voting_discipline"`; \}\>\>\>; `groupIds`: `ZodArray`\<`ZodString`\>; \}, `$strip`\>

Defined in: [schemas/europeanParliament.ts:473](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/schemas/europeanParliament.ts#L473)

Compare political groups input schema
