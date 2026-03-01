[**European Parliament MCP Server API v1.0.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/trackLegislation](../README.md) / handleTrackLegislation

# Function: handleTrackLegislation()

> **handleTrackLegislation**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/trackLegislation/index.ts:83](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/trackLegislation/index.ts#L83)

Handles the track_legislation MCP tool request.

Tracks a specific European Parliament legislative procedure through its full
lifecycle — from initial proposal through committee review, plenary vote,
trilogue, and final adoption. Accepts both EP API process-id format
(`2024-0006`) and human-readable reference format (`2024/0006(COD)`).

## Parameters

### args

`unknown`

Raw tool arguments, validated against [TrackLegislationSchema](../../../schemas/ep/analysis/variables/TrackLegislationSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing the procedure's current stage, timeline,
  committee assignments, voting records, and next-step projections

## Throws

If `args` fails schema validation (e.g., missing required fields or invalid format)

## Throws

If the European Parliament API is unreachable or returns an error response

## Example

```typescript
const result = await handleTrackLegislation({
  procedureId: '2024/0006(COD)'
});
// Returns legislative tracking with current stage, timeline milestones,
// committee assignments, and estimated adoption timeline
```

## Security

Input is validated with Zod before any API call.
  Personal data in responses is minimised per GDPR Article 5(1)(c).
  All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [trackLegislationToolMetadata](../variables/trackLegislationToolMetadata.md) for MCP schema registration
 - handleMonitorLegislativePipeline for pipeline-wide health and bottleneck analysis
