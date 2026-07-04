[**European Parliament MCP Server API v1.3.35**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/comparativeIntelligence](../README.md) / ComparativeIntelligenceSchema

# Variable: ComparativeIntelligenceSchema

> `const` **ComparativeIntelligenceSchema**: `ZodObject`\<[`ComparativeIntelligenceParams`](../type-aliases/ComparativeIntelligenceParams.md)\>

Defined in: [tools/comparativeIntelligence.ts:38](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/comparativeIntelligence.ts#L38)

Zod input schema for the `comparative_intelligence` MCP tool.

Validates a list of 2-10 MEP IDs and an optional set of comparison
dimensions (`voting`, `committee`, `legislative`, `attendance`).
