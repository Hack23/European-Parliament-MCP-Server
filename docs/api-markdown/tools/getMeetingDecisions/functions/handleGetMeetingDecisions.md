[**European Parliament MCP Server API v0.9.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getMeetingDecisions](../README.md) / handleGetMeetingDecisions

# Function: handleGetMeetingDecisions()

> **handleGetMeetingDecisions**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getMeetingDecisions.ts:44](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getMeetingDecisions.ts#L44)

Handles the get_meeting_decisions MCP tool request.

Retrieves decisions made in a specific European Parliament plenary sitting,
including adopted decisions and voting outcomes. Requires a sitting identifier.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetMeetingDecisionsSchema](../../../schemas/ep/activities/variables/GetMeetingDecisionsSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing a paginated list of decisions from the specified plenary sitting

## Throws

- If `args` fails schema validation (e.g., missing required `sittingId` or invalid format)
- If the European Parliament API is unreachable or returns an error response

## Example

```typescript
const result = await handleGetMeetingDecisions({ sittingId: 'PV-9-2024-01-15', limit: 50 });
// Returns up to 50 decisions from the specified plenary sitting
```

## Security

- Input is validated with Zod before any API call.
- Personal data in responses is minimised per GDPR Article 5(1)(c).
- All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [getMeetingDecisionsToolMetadata](../variables/getMeetingDecisionsToolMetadata.md) for MCP schema registration
 - handleGetMeetingActivities for retrieving the broader agenda of the same sitting
