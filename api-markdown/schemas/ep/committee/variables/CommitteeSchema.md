[**European Parliament MCP Server API v1.3.43**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/committee](../README.md) / CommitteeSchema

# Variable: CommitteeSchema

> `const` **CommitteeSchema**: `ZodObject`\<\{ `abbreviation`: `ZodString`; `chair`: `ZodOptional`\<`ZodString`\>; `id`: `ZodString`; `meetingSchedule`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `members`: `ZodArray`\<`ZodString`\>; `memberships`: `ZodOptional`\<`ZodArray`\<`ZodObject`\<\{ `contactPoint`: `ZodArray`\<`ZodObject`\<\{ `email`: `ZodOptional`\<`ZodString`\>; `hasSite`: `ZodOptional`\<`ZodString`\>; `hasTelephone`: `ZodOptional`\<`ZodObject`\<..., ...\>\>; `id`: `ZodOptional`\<`ZodString`\>; `officeAddress`: `ZodOptional`\<`ZodString`\>; `type`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>\>; `id`: `ZodOptional`\<`ZodString`\>; `identifier`: `ZodOptional`\<`ZodString`\>; `member`: `ZodString`; `memberDuring`: `ZodOptional`\<`ZodObject`\<\{ `endDate`: `ZodOptional`\<`ZodString`\>; `id`: `ZodString`; `startDate`: `ZodOptional`\<`ZodString`\>; `type`: `ZodString`; \}, `$strip`\>\>; `membershipClassification`: `ZodOptional`\<`ZodString`\>; `notation_codictFunctionId`: `ZodOptional`\<`ZodString`\>; `notation_codictMandateId`: `ZodOptional`\<`ZodString`\>; `organization`: `ZodOptional`\<`ZodString`\>; `represents`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `role`: `ZodOptional`\<`ZodString`\>; `type`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>\>\>; `name`: `ZodString`; `responsibilities`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `viceChairs`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; \}, `$strip`\>

Defined in: [schemas/ep/committee.ts:36](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/committee.ts#L36)

Committee output schema
