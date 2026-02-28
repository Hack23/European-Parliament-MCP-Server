[**European Parliament MCP Server API v0.9.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getPlenarySessions](../README.md) / handleGetPlenarySessions

# Function: handleGetPlenarySessions()

> **handleGetPlenarySessions**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getPlenarySessions.ts:60](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getPlenarySessions.ts#L60)

Handles the get_plenary_sessions MCP tool request.

Retrieves European Parliament plenary sessions with optional filtering by date range and
location. Supports single-session lookup by event ID. Critical for legislative monitoring,
session activity tracking, debate analysis, and identifying legislative priorities.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetPlenarySessionsSchema](../../../schemas/ep/plenary/variables/GetPlenarySessionsSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing either a single plenary session record (when `eventId`
  is provided) or a paginated list of sessions with date, location, agenda items, voting
  records, and attendance statistics

## Throws

- If `args` fails schema validation (e.g., date not in YYYY-MM-DD format,
  limit out of range 1–100)
- If the European Parliament API is unreachable or returns an error response

## Example

```typescript
// List sessions in a date range
const result = await handleGetPlenarySessions({
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31',
  limit: 20
});
// Returns up to 20 plenary sessions held in 2024

// Fetch a single session by event ID
const single = await handleGetPlenarySessions({ eventId: 'MTG-2024-01-15' });
// Returns agenda, voting records, and attendance for the specified session
```

## Security

- Input is validated with Zod before any API call.
- Personal data in responses is minimised per GDPR Article 5(1)(c).
- All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [getPlenarySessionsToolMetadata](../variables/getPlenarySessionsToolMetadata.md) for MCP schema registration
 - handleGetPlenaryDocuments for legislative documents associated with sessions
 - handleGetPlenarySessionDocuments for session-specific agendas and minutes
