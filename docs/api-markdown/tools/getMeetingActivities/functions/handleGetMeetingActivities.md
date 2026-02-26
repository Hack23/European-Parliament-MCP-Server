[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getMeetingActivities](../README.md) / handleGetMeetingActivities

# Function: handleGetMeetingActivities()

> **handleGetMeetingActivities**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getMeetingActivities.ts:44](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/tools/getMeetingActivities.ts#L44)

Handles the get_meeting_activities MCP tool request.

Retrieves activities linked to a specific European Parliament plenary sitting,
such as debates, votes, and presentations. Requires a sitting identifier.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetMeetingActivitiesSchema](../../../schemas/ep/activities/variables/GetMeetingActivitiesSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing a paginated list of activities for the specified plenary sitting

## Throws

If `args` fails schema validation (e.g., missing required `sittingId` or invalid format)

## Throws

If the European Parliament API is unreachable or returns an error response

## Example

```typescript
const result = await handleGetMeetingActivities({ sittingId: 'PV-9-2024-01-15', limit: 50 });
// Returns up to 50 activities from the specified plenary sitting
```

## Security

Input is validated with Zod before any API call.
  Personal data in responses is minimised per GDPR Article 5(1)(c).
  All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [getMeetingActivitiesToolMetadata](../variables/getMeetingActivitiesToolMetadata.md) for MCP schema registration
 - handleGetMeetingDecisions for retrieving decisions from the same sitting
