[**European Parliament MCP Server API v0.9.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/detectVotingAnomalies](../README.md) / handleDetectVotingAnomalies

# Function: handleDetectVotingAnomalies()

> **handleDetectVotingAnomalies**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/detectVotingAnomalies.ts:296](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/detectVotingAnomalies.ts#L296)

Handles the detect_voting_anomalies MCP tool request.

Detects statistically unusual voting patterns for individual MEPs or entire
political groups, including cross-party defections, unusual abstention clusters,
and discipline breakdowns. Returns anomaly records graded by severity with a
group stability score and defection trend assessment.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [DetectVotingAnomaliesSchema](../../../schemas/ep/analysis/variables/DetectVotingAnomaliesSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing detected anomalies with severity ratings,
  summary statistics, anomaly rate, severity index, and risk level classification

## Throws

- If `args` fails schema validation (e.g., missing required fields or invalid format)
- If the European Parliament API is unreachable or returns an error response

## Example

```typescript
const result = await handleDetectVotingAnomalies({
  mepId: '124810',
  sensitivityThreshold: 0.7,
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});
// Returns anomaly list with severity ratings (HIGH/MEDIUM/LOW),
// anomaly rate, severity index, and group stability score
```

## Security

- Input is validated with Zod before any API call.
- Personal data in responses is minimised per GDPR Article 5(1)(c).
- All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [detectVotingAnomaliesToolMetadata](../variables/detectVotingAnomaliesToolMetadata.md) for MCP schema registration
 - handleAnalyzeCoalitionDynamics for coalition-level cohesion and stress analysis
