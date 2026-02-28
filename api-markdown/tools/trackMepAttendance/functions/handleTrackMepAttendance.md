[**European Parliament MCP Server API v0.9.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/trackMepAttendance](../README.md) / handleTrackMepAttendance

# Function: handleTrackMepAttendance()

> **handleTrackMepAttendance**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/trackMepAttendance.ts:334](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/trackMepAttendance.ts#L334)

Handles the track_mep_attendance MCP tool request.

Tracks plenary attendance and participation rates for individual MEPs or groups
of MEPs filtered by country or political group. Derives attendance metrics from
plenary vote participation records and computes an overall attendance rating and
trend for each MEP.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [TrackMepAttendanceSchema](../variables/TrackMepAttendanceSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing individual MEP attendance rates, overall summary
  statistics, attendance trend classification, and computed participation scores

## Throws

- If `args` fails schema validation (e.g., missing required fields or invalid format)
- If the European Parliament API is unreachable or returns an error response

## Example

```typescript
const result = await handleTrackMepAttendance({
  mepId: '124810',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});
// Returns attendance analysis with participation rate, trend,
// and session-level breakdown for the specified MEP
```

## Security

- Input is validated with Zod before any API call.
- Personal data in responses is minimised per GDPR Article 5(1)(c).
- All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [trackMepAttendanceToolMetadata](../variables/trackMepAttendanceToolMetadata.md) for MCP schema registration
 - [handleAssessMepInfluence](../../assessMepInfluence/functions/handleAssessMepInfluence.md) for comprehensive MEP influence and activity scoring
