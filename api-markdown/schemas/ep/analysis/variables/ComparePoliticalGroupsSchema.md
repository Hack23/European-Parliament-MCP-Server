[**European Parliament MCP Server API v0.8.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/analysis](../README.md) / ComparePoliticalGroupsSchema

# Variable: ComparePoliticalGroupsSchema

> `const` **ComparePoliticalGroupsSchema**: `ZodObject`\<\{ `dateFrom`: `ZodOptional`\<`ZodString`\>; `dateTo`: `ZodOptional`\<`ZodString`\>; `dimensions`: `ZodOptional`\<`ZodArray`\<`ZodEnum`\<\{ `activity_level`: `"activity_level"`; `attendance`: `"attendance"`; `cohesion`: `"cohesion"`; `legislative_output`: `"legislative_output"`; `voting_discipline`: `"voting_discipline"`; \}\>\>\>; `groupIds`: `ZodArray`\<`ZodString`\>; \}, `$strip`\>

Defined in: [schemas/ep/analysis.ts:112](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/schemas/ep/analysis.ts#L112)

Compare political groups input schema
