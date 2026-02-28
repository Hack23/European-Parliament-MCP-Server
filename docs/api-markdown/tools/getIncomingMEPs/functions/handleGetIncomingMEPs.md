[**European Parliament MCP Server API v0.9.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getIncomingMEPs](../README.md) / handleGetIncomingMEPs

# Function: handleGetIncomingMEPs()

> **handleGetIncomingMEPs**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getIncomingMEPs.ts:49](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getIncomingMEPs.ts#L49)

Handles the get_incoming_meps MCP tool request.

Retrieves Members of European Parliament who are newly joining parliament during the
current parliamentary term. Useful for tracking political transitions, onboarding
patterns, and early-engagement stakeholder analysis.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetIncomingMEPsSchema](../../../schemas/ep/mep/variables/GetIncomingMEPsSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing a paginated list of incoming MEP records for the
  current parliamentary term

## Throws

- If `args` fails schema validation (e.g., limit out of range 1–100)
- If the European Parliament API is unreachable or returns an error response

## Example

```typescript
const result = await handleGetIncomingMEPs({ limit: 20, offset: 0 });
// Returns up to 20 MEPs who are newly joining the current parliamentary term
```

## Security

- Input is validated with Zod before any API call.
- Personal data in responses is minimised per GDPR Article 5(1)(c).
- All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [getIncomingMEPsToolMetadata](../variables/getIncomingMEPsToolMetadata.md) for MCP schema registration
 - handleGetCurrentMEPs for all currently active MEPs
 - handleGetOutgoingMEPs for MEPs who are departing parliament
