[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getEvents](../README.md) / handleGetEvents

# Function: handleGetEvents()

> **handleGetEvents**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getEvents.ts:54](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getEvents.ts#L54)

Handles the get_events MCP tool request.

Retrieves European Parliament events including hearings, conferences, and seminars.
Supports single event lookup by eventId or a paginated list filtered by date range.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetEventsSchema](../../../schemas/ep/activities/variables/GetEventsSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing either a single event record or a paginated list of EP events

## Throws

- If `args` fails schema validation (e.g., missing required fields or invalid format)
- If the European Parliament API is unreachable or returns an error response

## Example

```typescript
// Single event lookup
const result = await handleGetEvents({ eventId: 'EVT-2024-001' });
// Returns the full record for the specified event

// List events within a date range
const list = await handleGetEvents({ dateFrom: '2024-06-01', dateTo: '2024-06-30', limit: 30 });
// Returns up to 30 EP events in June 2024
```

## Security

- Input is validated with Zod before any API call.
- Personal data in responses is minimised per GDPR Article 5(1)(c).
- All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [getEventsToolMetadata](../variables/getEventsToolMetadata.md) for MCP schema registration
 - handleGetMeetingActivities for retrieving activities within a specific plenary sitting
