[**European Parliament MCP Server API v1.0.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/comparePoliticalGroups](../README.md) / handleComparePoliticalGroups

# Function: handleComparePoliticalGroups()

> **handleComparePoliticalGroups**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/comparePoliticalGroups.ts:179](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/comparePoliticalGroups.ts#L179)

Handles the compare_political_groups MCP tool request.

Compares European Parliament political groups across configurable dimensions
including voting discipline, activity level, legislative output, attendance,
and internal cohesion. Produces ranked comparisons and an overall performance
score for each group.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [ComparePoliticalGroupsSchema](../../../schemas/ep/analysis/variables/ComparePoliticalGroupsSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing per-group dimension scores, rankings,
  seat-share distribution, and a computed parliamentary balance index

## Throws

- If `args` fails schema validation (e.g., missing required fields or invalid format)
- If the European Parliament API is unreachable or returns an error response

## Example

```typescript
const result = await handleComparePoliticalGroups({
  groupIds: ['EPP', 'S&D', 'Renew', 'Greens/EFA'],
  dimensions: ['voting_discipline', 'activity_level', 'cohesion'],
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});
// Returns ranked group comparison with per-dimension scores
// and overall performance leaderboard
```

## Security

- Input is validated with Zod before any API call.
- Personal data in responses is minimised per GDPR Article 5(1)(c).
- All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [comparePoliticalGroupsToolMetadata](../variables/comparePoliticalGroupsToolMetadata.md) for MCP schema registration
 - handleAnalyzeCoalitionDynamics for pairwise coalition cohesion analysis
