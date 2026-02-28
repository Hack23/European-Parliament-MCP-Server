[**European Parliament MCP Server API v0.9.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getMeetingForeseenActivities](../README.md) / handleGetMeetingForeseenActivities

# Function: handleGetMeetingForeseenActivities()

> **handleGetMeetingForeseenActivities**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getMeetingForeseenActivities.ts:50](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getMeetingForeseenActivities.ts#L50)

Handles the get_meeting_foreseen_activities MCP tool request.

Retrieves planned agenda items (foreseen activities) linked to a specific EP plenary
sitting, enabling proactive intelligence collection ahead of scheduled meetings.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetMeetingForeseenActivitiesSchema](../../../schemas/ep/activities/variables/GetMeetingForeseenActivitiesSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing foreseen activity records for the requested sitting

## Throws

- If `args` fails schema validation (e.g., missing required `sittingId` field)
- If the European Parliament API is unreachable or returns an error response

## Example

```typescript
const result = await handleGetMeetingForeseenActivities({
  sittingId: 'PV-9-2024-04-22',
  limit: 20,
  offset: 0
});
// Returns planned agenda items for plenary sitting PV-9-2024-04-22
```

## Security

- Input is validated with Zod before any API call.
- Personal data in responses is minimised per GDPR Article 5(1)(c).
- All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [getMeetingForeseenActivitiesToolMetadata](../variables/getMeetingForeseenActivitiesToolMetadata.md) for MCP schema registration
 - handleGetMeetings for retrieving the parent meeting records
