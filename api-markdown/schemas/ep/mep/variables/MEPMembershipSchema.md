[**European Parliament MCP Server API v1.4.3**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/mep](../README.md) / MEPMembershipSchema

# Variable: MEPMembershipSchema

> `const` **MEPMembershipSchema**: `ZodObject`\<\{ `contactPoint`: `ZodArray`\<`ZodObject`\<\{ `email`: `ZodOptional`\<`ZodString`\>; `hasSite`: `ZodOptional`\<`ZodString`\>; `hasTelephone`: `ZodOptional`\<`ZodObject`\<\{ `hasValue`: `ZodOptional`\<`ZodString`\>; `id`: `ZodOptional`\<`ZodString`\>; `type`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>\>; `id`: `ZodOptional`\<`ZodString`\>; `officeAddress`: `ZodOptional`\<`ZodString`\>; `type`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>\>; `id`: `ZodOptional`\<`ZodString`\>; `identifier`: `ZodOptional`\<`ZodString`\>; `memberDuring`: `ZodOptional`\<`ZodObject`\<\{ `endDate`: `ZodOptional`\<`ZodString`\>; `id`: `ZodString`; `startDate`: `ZodOptional`\<`ZodString`\>; `type`: `ZodString`; \}, `$strip`\>\>; `membershipClassification`: `ZodOptional`\<`ZodString`\>; `notation_codictFunctionId`: `ZodOptional`\<`ZodString`\>; `notation_codictMandateId`: `ZodOptional`\<`ZodString`\>; `organization`: `ZodOptional`\<`ZodString`\>; `represents`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `role`: `ZodOptional`\<`ZodString`\>; `type`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>

Defined in: [schemas/ep/mep.ts:106](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/mep.ts#L106)
