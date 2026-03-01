[**European Parliament MCP Server API v1.0.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/analyzeLegislativeEffectiveness](../README.md) / handleAnalyzeLegislativeEffectiveness

# Function: handleAnalyzeLegislativeEffectiveness()

> **handleAnalyzeLegislativeEffectiveness**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/analyzeLegislativeEffectiveness.ts:221](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/analyzeLegislativeEffectiveness.ts#L221)

Handles the analyze_legislative_effectiveness MCP tool request.

Scores the legislative effectiveness of an MEP or committee by computing productivity
(reports authored, amendments tabled), quality (amendment success rate, attendance),
and impact (voting influence, rapporteurships, committee coverage) sub-scores, then
aggregates them into an overall effectiveness rating with peer-benchmarking data.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [AnalyzeLegislativeEffectivenessSchema](../../../schemas/ep/analysis/variables/AnalyzeLegislativeEffectivenessSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing a LegislativeEffectivenessAnalysis object with
  metrics, scores, computed attributes (percentile, output per month), benchmarks,
  confidence level, and methodology note

## Throws

- If `args` fails schema validation (e.g., missing required `subjectType`
  or `subjectId`, invalid `subjectType` value)
- If the European Parliament API is unreachable or returns an error response

## Example

```typescript
// Analyse a specific MEP
const mepResult = await handleAnalyzeLegislativeEffectiveness({
  subjectType: 'MEP',
  subjectId: 'MEP-124810',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});
// Returns productivity/quality/impact scores and effectiveness rank for MEP-124810

// Analyse a committee
const committeeResult = await handleAnalyzeLegislativeEffectiveness({
  subjectType: 'COMMITTEE',
  subjectId: 'ENVI'
});
// Returns legislative effectiveness scores for the ENVI committee
```

## Security

- Input is validated with Zod before any API call.
- Personal data in responses is minimised per GDPR Article 5(1)(c).
- All requests are rate-limited and audit-logged per ISMS Policy AU-002.
  Internal errors are wrapped before propagation to avoid leaking API details.

## Since

0.8.0

## See

 - [analyzeLegislativeEffectivenessToolMetadata](../variables/analyzeLegislativeEffectivenessToolMetadata.md) for MCP schema registration
 - handleAnalyzeVotingPatterns for detailed per-vote behaviour analysis
