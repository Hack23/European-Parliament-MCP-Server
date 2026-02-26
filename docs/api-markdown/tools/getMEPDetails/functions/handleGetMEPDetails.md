[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getMEPDetails](../README.md) / handleGetMEPDetails

# Function: handleGetMEPDetails()

> **handleGetMEPDetails**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

Defined in: [tools/getMEPDetails.ts:48](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/tools/getMEPDetails.ts#L48)

Handles the get_mep_details MCP tool request.

Retrieves comprehensive information about a single MEP identified by their unique ID,
including biography, contact details, committee memberships, voting statistics, and
parliamentary activities. Access to personal data is audit-logged for GDPR compliance.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetMEPDetailsSchema](../../../schemas/ep/mep/variables/GetMEPDetailsSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

MCP tool result containing detailed MEP profile data including biography,
  contact information, committee roles, voting record, and activity statistics

## Throws

If `args` fails schema validation (e.g., missing or empty `id` field)

## Throws

If the European Parliament API is unreachable or returns an error response

## Example

```typescript
const result = await handleGetMEPDetails({ id: 'MEP-124810' });
// Returns full profile for MEP 124810, including committees and voting stats
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
