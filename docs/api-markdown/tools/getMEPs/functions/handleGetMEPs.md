[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getMEPs](../README.md) / handleGetMEPs

# Function: handleGetMEPs()

> **handleGetMEPs**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getMEPs.ts:58](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getMEPs.ts#L58)

Handles the get_meps MCP tool request.

Retrieves Members of European Parliament with optional filtering by country, political
group, committee, and active status. Results are paginated and GDPR-compliant.

**Intelligence Use Cases:** Filter by country for national delegation analysis, by group for
cohesion studies, by committee for policy domain expertise mapping.

**Business Use Cases:** Power stakeholder mapping products, political risk dashboards,
and MEP engagement tracking for corporate affairs teams.

**Marketing Use Cases:** Demo-ready endpoint for showcasing EP data access to potential
API consumers, journalists, and civic tech developers.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetMEPsSchema](../../../schemas/ep/mep/variables/GetMEPsSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing a paginated list of MEP records with name, country,
  political group, committee memberships, and contact information

## Throws

- If `args` fails schema validation (e.g., country code not 2 uppercase
  letters, limit out of range 1–100)
- If the European Parliament API is unreachable or returns an error response

## Example

```typescript
const result = await handleGetMEPs({ country: 'SE', limit: 10 });
// Returns up to 10 Swedish MEPs with group and committee details
```

## Security

- Input is validated with Zod before any API call.
- Personal data in responses is minimised per GDPR Article 5(1)(c).
- All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [getMEPsToolMetadata](../variables/getMEPsToolMetadata.md) for MCP schema registration
 - handleGetMEPDetails for retrieving full details of a single MEP
