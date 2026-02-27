[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/analyzeCoalitionDynamics](../README.md) / handleAnalyzeCoalitionDynamics

# Function: handleAnalyzeCoalitionDynamics()

> **handleAnalyzeCoalitionDynamics**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/analyzeCoalitionDynamics.ts:261](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/analyzeCoalitionDynamics.ts#L261)

Handles the analyze_coalition_dynamics MCP tool request.

Detects voting coalitions, cross-party alliances, group cohesion rates, and
coalition stress indicators across European Parliament political groups.
Uses CIA Coalition Analysis methodology to measure parliamentary fragmentation,
effective number of parties, and grand-coalition viability.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [AnalyzeCoalitionDynamicsSchema](../../../schemas/ep/analysis/variables/AnalyzeCoalitionDynamicsSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing coalition pair cohesion scores, group cohesion
  metrics, dominant coalition, stress indicators, and computed fragmentation attributes

## Throws

- If `args` fails schema validation (e.g., missing required fields or invalid format)
- If the European Parliament API is unreachable or returns an error response

## Example

```typescript
const result = await handleAnalyzeCoalitionDynamics({
  groupIds: ['EPP', 'S&D', 'Renew'],
  minimumCohesion: 0.5,
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});
// Returns coalition pair analysis with cohesion scores, stress indicators,
// and parliamentary fragmentation index
```

## Security

- Input is validated with Zod before any API call.
- Personal data in responses is minimised per GDPR Article 5(1)(c).
- All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [analyzeCoalitionDynamicsToolMetadata](../variables/analyzeCoalitionDynamicsToolMetadata.md) for MCP schema registration
 - handleComparePoliticalGroups for per-group dimension comparison
