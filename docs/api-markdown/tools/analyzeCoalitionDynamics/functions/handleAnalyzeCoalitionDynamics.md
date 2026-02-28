[**European Parliament MCP Server API v0.9.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/analyzeCoalitionDynamics](../README.md) / handleAnalyzeCoalitionDynamics

# Function: handleAnalyzeCoalitionDynamics()

> **handleAnalyzeCoalitionDynamics**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/analyzeCoalitionDynamics.ts:313](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/analyzeCoalitionDynamics.ts#L313)

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

## Examples

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

```typescript
// Analyze all political groups with default settings
const result = await handleAnalyzeCoalitionDynamics({});
const analysis = JSON.parse(result.content[0].text);
console.log(`Fragmentation index: ${analysis.computedAttributes.parliamentaryFragmentation}`);
```

```typescript
// Analyze specific groups with higher alliance threshold
const result = await handleAnalyzeCoalitionDynamics({
  groupIds: ["EPP", "S&D", "Renew"],
  minimumCohesion: 0.6,
  dateFrom: "2024-01-01",
  dateTo: "2024-12-31"
});
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
Analyze coalition dynamics tool handler

Detects voting coalitions, measures political group cohesion, and identifies
cross-party alliances using CIA Coalition Analysis methodology. Fetches real
MEP membership counts from the EP Open Data API; pairwise cohesion is derived
from group-size ratios (per-MEP voting statistics are not available from the
EP API `/meps/{id}` endpoint).

**Analysis outputs:**
- Group cohesion metrics (member count, stress indicator, fragmentation risk)
- Pairwise coalition strength for each group combination
- Dominant coalition identification
- Stress indicators for groups with high internal tension
- Parliament-wide fragmentation index (Herfindahl–Hirschman)
- Effective number of parties (ENP)

> **Note:** Confidence level is always `LOW` because per-MEP voting statistics
> are unavailable from the current EP API. Cohesion/defection metrics report
> zero and should be supplemented with vote-result data when available.

## Throws

When the EP API request fails or group data cannot be fetched

## Throws

When input fails schema validation (invalid group IDs, date format)

## Security

Input validated by Zod. Errors sanitized (no stack traces exposed).
ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
