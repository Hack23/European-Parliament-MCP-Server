[**European Parliament MCP Server API v0.8.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/committee](../README.md) / CommitteeSchema

# Variable: CommitteeSchema

> `const` **CommitteeSchema**: `ZodObject`\<\{ `abbreviation`: `ZodString`; `chair`: `ZodOptional`\<`ZodString`\>; `id`: `ZodString`; `meetingSchedule`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `members`: `ZodArray`\<`ZodString`\>; `name`: `ZodString`; `responsibilities`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `viceChairs`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; \}, `$strip`\>

Defined in: [schemas/ep/committee.ts:32](https://github.com/Hack23/European-Parliament-MCP-Server/blob/67dbd67a8f5629591a17b9785bfa0977f7023afb/src/schemas/ep/committee.ts#L32)

Committee output schema
