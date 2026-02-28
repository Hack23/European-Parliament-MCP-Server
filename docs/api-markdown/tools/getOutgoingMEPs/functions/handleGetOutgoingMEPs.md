[**European Parliament MCP Server API v0.9.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getOutgoingMEPs](../README.md) / handleGetOutgoingMEPs

# Function: handleGetOutgoingMEPs()

> **handleGetOutgoingMEPs**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getOutgoingMEPs.ts:49](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getOutgoingMEPs.ts#L49)

Handles the get_outgoing_meps MCP tool request.

Retrieves Members of European Parliament who are departing parliament during the current
parliamentary term. Useful for monitoring political transitions, succession analysis, and
identifying final-engagement opportunities with outgoing stakeholders.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetOutgoingMEPsSchema](../../../schemas/ep/mep/variables/GetOutgoingMEPsSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing a paginated list of outgoing MEP records for the
  current parliamentary term

## Throws

- If `args` fails schema validation (e.g., limit out of range 1–100)
- If the European Parliament API is unreachable or returns an error response

## Example

```typescript
const result = await handleGetOutgoingMEPs({ limit: 20, offset: 0 });
// Returns up to 20 MEPs who are leaving the current parliamentary term
```

## Security

- Input is validated with Zod before any API call.
- Personal data in responses is minimised per GDPR Article 5(1)(c).
- All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [getOutgoingMEPsToolMetadata](../variables/getOutgoingMEPsToolMetadata.md) for MCP schema registration
 - handleGetCurrentMEPs for all currently active MEPs
 - handleGetIncomingMEPs for MEPs who are newly joining parliament
