[**European Parliament MCP Server API v0.8.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/committee](../README.md) / CommitteeSchema

# Variable: CommitteeSchema

> `const` **CommitteeSchema**: `ZodObject`\<\{ `abbreviation`: `ZodString`; `chair`: `ZodOptional`\<`ZodString`\>; `id`: `ZodString`; `meetingSchedule`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `members`: `ZodArray`\<`ZodString`\>; `name`: `ZodString`; `responsibilities`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `viceChairs`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; \}, `$strip`\>

Defined in: [schemas/ep/committee.ts:32](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/schemas/ep/committee.ts#L32)

Committee output schema
