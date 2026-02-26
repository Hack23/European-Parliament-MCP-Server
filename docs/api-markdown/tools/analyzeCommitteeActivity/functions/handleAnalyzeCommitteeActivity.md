[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/analyzeCommitteeActivity](../README.md) / handleAnalyzeCommitteeActivity

# Function: handleAnalyzeCommitteeActivity()

> **handleAnalyzeCommitteeActivity**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

Defined in: [tools/analyzeCommitteeActivity.ts:225](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/tools/analyzeCommitteeActivity.ts#L225)

Handles the analyze_committee_activity MCP tool request.

Analyses an EP committee's workload, meeting frequency, document production, member
engagement, and legislative output over a given period using real data from the
European Parliament Open Data Portal. Provides computed attributes including workload
intensity, productivity score, engagement level, and policy impact rating.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [AnalyzeCommitteeActivitySchema](../variables/AnalyzeCommitteeActivitySchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

MCP tool result containing a CommitteeActivityAnalysis object with
  metrics, computed attributes, confidence level, and methodology note

## Throws

If `args` fails schema validation (e.g., missing required `committeeId`)

## Throws

If the European Parliament API is unreachable or returns an error response

## Example

```typescript
const result = await handleAnalyzeCommitteeActivity({
  committeeId: 'ENVI',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});
// Returns workload, engagement, and legislative output for the ENVI committee in 2024
```

## Security

Input is validated with Zod before any API call.
  Personal data in responses is minimised per GDPR Article 5(1)(c).
  All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [analyzeCommitteeActivityToolMetadata](../variables/analyzeCommitteeActivityToolMetadata.md) for MCP schema registration
 - handleAnalyzeCountryDelegation for delegation-level analysis across committees
