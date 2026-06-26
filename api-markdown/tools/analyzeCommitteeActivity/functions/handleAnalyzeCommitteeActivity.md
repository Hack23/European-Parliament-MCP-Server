[**European Parliament MCP Server API v1.3.29**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/analyzeCommitteeActivity](../README.md) / handleAnalyzeCommitteeActivity

# Function: handleAnalyzeCommitteeActivity()

> **handleAnalyzeCommitteeActivity**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/analyzeCommitteeActivity.ts:728](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/analyzeCommitteeActivity.ts#L728)

Handles the analyze_committee_activity MCP tool request.

Analyses an EP committee's workload, meeting frequency, document production,
member engagement, and legislative output over a given period using real
data from the European Parliament Open Data Portal. Provides computed
attributes including workload intensity, productivity score, engagement
level, policy impact rating, and per-source data-availability tags.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [AnalyzeCommitteeActivitySchema](../variables/AnalyzeCommitteeActivitySchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing a CommitteeActivityAnalysis

## Throws

If `args` fails schema validation or the committee lookup fails.

## Example

```typescript
const result = await handleAnalyzeCommitteeActivity({
  committeeId: 'ENVI',
  dateFrom: '2024-01-01',
  dateTo: '2024-06-30'
});
```

## Security

Input is validated with Zod before any API call. All sub-fetches
  are audit-logged with truncated counts (ISMS AU-002). Per-source 5 s
  timeouts use AbortController to prevent dangling fetch connections.

## Performance

Warm cache: <200 ms. Cold: ~5–10 s (per-source 5 s budgets).

## Since

0.8.0

## See

[analyzeCommitteeActivityToolMetadata](../variables/analyzeCommitteeActivityToolMetadata.md)
