[**European Parliament MCP Server API v1.4.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getMEPDetails](../README.md) / handleGetMEPDetails

# Function: handleGetMEPDetails()

> **handleGetMEPDetails**(`args`): `Promise`\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getMEPDetails.ts:76](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getMEPDetails.ts#L76)

Handles the get_mep_details MCP tool request.

Retrieves the complete EP API v2 profile for a single MEP, including
biographical fields and full membership history. Access to personal data is
audit-logged for GDPR compliance.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetMEPDetailsSchema](../../../schemas/ep/mep/variables/GetMEPDetailsSchema.md)

## Returns

`Promise`\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing the detailed MEP profile and membership records

## Throws

- If `args` fails schema validation (e.g., missing or empty `id` field)
- If the European Parliament API is unreachable or returns an error response

## Example

```typescript
const result = await handleGetMEPDetails({ id: 'MEP-124810' });
// Returns the EP profile for MEP 124810, including complete memberships
```

## Security

Input is validated with Zod before any API call.
  Personal data (biography, contact info) access is audit-logged per GDPR Art. 5(2)
  and ISMS Policy AU-002. Data minimisation applied per GDPR Article 5(1)(c).

## Since

0.8.0

## See

 - [getMEPDetailsToolMetadata](../variables/getMEPDetailsToolMetadata.md) for MCP schema registration
 - handleGetMEPs for listing MEPs and obtaining valid IDs
