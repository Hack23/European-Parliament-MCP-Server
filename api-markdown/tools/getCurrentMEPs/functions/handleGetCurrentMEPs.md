[**European Parliament MCP Server API v1.0.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getCurrentMEPs](../README.md) / handleGetCurrentMEPs

# Function: handleGetCurrentMEPs()

> **handleGetCurrentMEPs**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getCurrentMEPs.ts:46](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getCurrentMEPs.ts#L46)

Handles the get_current_meps MCP tool request.

Retrieves Members of European Parliament who hold an active mandate as of today's date.
Outgoing or inactive members are excluded, providing a real-time snapshot of the current
parliamentary composition.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetCurrentMEPsSchema](../../../schemas/ep/mep/variables/GetCurrentMEPsSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing a paginated list of currently active MEP records

## Throws

- If `args` fails schema validation (e.g., limit out of range 1–100)
- If the European Parliament API is unreachable or returns an error response

## Example

```typescript
const result = await handleGetCurrentMEPs({ limit: 50, offset: 0 });
// Returns up to 50 MEPs with active mandates as of today
```

## Security

- Input is validated with Zod before any API call.
- Personal data in responses is minimised per GDPR Article 5(1)(c).
- All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [getCurrentMEPsToolMetadata](../variables/getCurrentMEPsToolMetadata.md) for MCP schema registration
 - handleGetIncomingMEPs for MEPs who are newly joining parliament
 - handleGetOutgoingMEPs for MEPs who are departing parliament
