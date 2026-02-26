[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/trackMepAttendance](../README.md) / handleTrackMepAttendance

# Function: handleTrackMepAttendance()

> **handleTrackMepAttendance**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

Defined in: [tools/trackMepAttendance.ts:327](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/tools/trackMepAttendance.ts#L327)

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

MCP tool result containing individual MEP attendance rates, overall summary
  statistics, attendance trend classification, and computed participation scores

## Throws

If `args` fails schema validation (e.g., missing required fields or invalid format)

## Throws

If the European Parliament API is unreachable or returns an error response

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

Input is validated with Zod before any API call.
  Personal data in responses is minimised per GDPR Article 5(1)(c).
  All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [trackMepAttendanceToolMetadata](../variables/trackMepAttendanceToolMetadata.md) for MCP schema registration
 - handleAssessMepInfluence for comprehensive MEP influence and activity scoring
