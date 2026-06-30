[**European Parliament MCP Server API v1.3.32**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/analyzeLegislativeEffectiveness](../README.md) / handleAnalyzeLegislativeEffectiveness

# Function: handleAnalyzeLegislativeEffectiveness()

> **handleAnalyzeLegislativeEffectiveness**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/analyzeLegislativeEffectiveness.ts:778](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/analyzeLegislativeEffectiveness.ts#L778)

Handles the `analyze_legislative_effectiveness` MCP tool request.

Fans out four EP Open Data Portal sources in parallel under independent
6 s timeouts, then aggregates the results through
[aggregateLegislativeEffectiveness](../../../utils/effectivenessAggregator/functions/aggregateLegislativeEffectiveness.md) to produce defensible
effectiveness metrics for an MEP or committee.

## Parameters

### args

`unknown`

Raw tool arguments, validated against
  [AnalyzeLegislativeEffectivenessSchema](../../../schemas/ep/analysis/variables/AnalyzeLegislativeEffectivenessSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result with a LegislativeEffectivenessAnalysis
  envelope that includes metrics, scores, per-source `dataSources` flags,
  `dataQualityWarnings`, and full attribution lists sorted ascending.

## Example

```typescript
const result = await handleAnalyzeLegislativeEffectiveness({
  subjectType: 'MEP',
  subjectId: 'person/124936',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31',
});
```

## Security

Input is validated with Zod before any API call. Per-source
  fetches are audit-logged with truncated counts (no MEP names beyond IDs).
  Per-source 6 s timeouts use AbortController to prevent dangling fetches.

## Performance

Warm cache: <300 ms. Cold worst case: ≈6-8 s (parallel
  sources). 15-minute cache keyed by (subjectType, subjectId, dateFrom,
  dateTo).

## Since

0.8.0

## See

[analyzeLegislativeEffectivenessToolMetadata](../variables/analyzeLegislativeEffectivenessToolMetadata.md)
