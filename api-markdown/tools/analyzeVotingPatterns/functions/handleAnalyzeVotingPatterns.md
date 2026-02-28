[**European Parliament MCP Server API v0.9.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/analyzeVotingPatterns](../README.md) / handleAnalyzeVotingPatterns

# Function: handleAnalyzeVotingPatterns()

> **handleAnalyzeVotingPatterns**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/analyzeVotingPatterns.ts:141](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/analyzeVotingPatterns.ts#L141)

Handles the analyze_voting_patterns MCP tool request.

Analyses an MEP's voting behaviour over an optional date range, computing group
alignment rate, cross-party voting frequency, attendance rate, and a data-quality
confidence level. When `compareWithGroup` is `true`, group alignment metrics are
included in the result.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [AnalyzeVotingPatternsSchema](../../../schemas/ep/analysis/variables/AnalyzeVotingPatternsSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing a VotingPatternAnalysis object, or a
  `dataAvailable: false` notice when voting statistics are unavailable from the EP API

## Throws

- If `args` fails schema validation (e.g., missing required `mepId`, bad date format)
- If the European Parliament API is unreachable or returns an error response

## Example

```typescript
const result = await handleAnalyzeVotingPatterns({
  mepId: 'MEP-124810',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31',
  compareWithGroup: true
});
// Returns voting statistics, group alignment, and confidence level for MEP-124810
```

## Security

Input is validated with Zod before any API call.
  Personal data (MEP name, voting records) is minimised per GDPR Article 5(1)(c).
  All requests are rate-limited and audit-logged per ISMS Policy AU-002.
  Internal errors are wrapped before propagation to avoid leaking API details.

## Since

0.8.0

## See

 - [analyzeVotingPatternsToolMetadata](../variables/analyzeVotingPatternsToolMetadata.md) for MCP schema registration
 - handleAnalyzeLegislativeEffectiveness for broader legislative effectiveness scoring
