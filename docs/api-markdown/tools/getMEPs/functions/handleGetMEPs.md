[**European Parliament MCP Server API v0.9.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getMEPs](../README.md) / handleGetMEPs

# Function: handleGetMEPs()

> **handleGetMEPs**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getMEPs.ts:81](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getMEPs.ts#L81)

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

## Examples

```typescript
const result = await handleGetMEPs({ country: 'SE', limit: 10 });
// Returns up to 10 Swedish MEPs with group and committee details
```

```typescript
// Get Swedish MEPs
const result = await handleGetMEPs({ country: "SE", limit: 10 });
const data = JSON.parse(result.content[0].text);
console.log(`Found ${data.total} Swedish MEPs`);
```

```typescript
// Get active EPP group members
const result = await handleGetMEPs({ group: "EPP", active: true, limit: 50 });
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

## Throws

When the EP API request fails or returns an unexpected error

## Throws

When input fails schema validation (invalid country code, out-of-range limit, etc.)

## Security

Input validated by Zod schema before any API call. Errors are sanitized
to avoid exposing internal implementation details. Personal data access is
audit-logged per GDPR Article 30. ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
