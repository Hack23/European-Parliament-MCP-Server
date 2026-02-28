[**European Parliament MCP Server API v0.9.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/monitorLegislativePipeline](../README.md) / handleMonitorLegislativePipeline

# Function: handleMonitorLegislativePipeline()

> **handleMonitorLegislativePipeline**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/monitorLegislativePipeline.ts:275](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/monitorLegislativePipeline.ts#L275)

Handles the monitor_legislative_pipeline MCP tool request.

Monitors the European Parliament's active legislative pipeline by fetching real
procedures from the EP API and computing health metrics including bottleneck
detection, stalled-procedure rate, throughput rate, and legislative momentum.
All procedure data (title, type, stage, status, dates, committee) is sourced
directly from the EP API; computed attributes are derived from real dates and stages.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [MonitorLegislativePipelineSchema](../../../schemas/ep/analysis/variables/MonitorLegislativePipelineSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing pipeline items with stage and status,
  summary counts (active/stalled/completed), detected bottlenecks, pipeline health
  score, throughput rate, bottleneck index, and legislative momentum classification

## Throws

- If `args` fails schema validation (e.g., missing required fields or invalid format)
- If the European Parliament API is unreachable or returns an error response

## Example

```typescript
const result = await handleMonitorLegislativePipeline({
  status: 'ACTIVE',
  committee: 'ENVI',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31',
  limit: 20
});
// Returns pipeline health score, stalled/active/completed counts,
// bottleneck list, and legislative momentum assessment
```

## Security

- Input is validated with Zod before any API call.
- Personal data in responses is minimised per GDPR Article 5(1)(c).
- All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [monitorLegislativePipelineToolMetadata](../variables/monitorLegislativePipelineToolMetadata.md) for MCP schema registration
 - handleTrackLegislation for individual procedure stage and timeline tracking
