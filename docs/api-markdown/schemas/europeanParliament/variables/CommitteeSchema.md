[**European Parliament MCP Server API v0.6.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [schemas/europeanParliament](../README.md) / CommitteeSchema

# Variable: CommitteeSchema

> `const` **CommitteeSchema**: `ZodObject`\<\{ `abbreviation`: `ZodString`; `chair`: `ZodOptional`\<`ZodString`\>; `id`: `ZodString`; `meetingSchedule`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `members`: `ZodArray`\<`ZodString`\>; `name`: `ZodString`; `responsibilities`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `viceChairs`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; \}, `$strip`\>

Defined in: [schemas/europeanParliament.ts:301](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/schemas/europeanParliament.ts#L301)

Committee output schema
