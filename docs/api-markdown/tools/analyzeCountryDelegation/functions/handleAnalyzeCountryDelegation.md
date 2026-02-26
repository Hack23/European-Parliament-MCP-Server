[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/analyzeCountryDelegation](../README.md) / handleAnalyzeCountryDelegation

# Function: handleAnalyzeCountryDelegation()

> **handleAnalyzeCountryDelegation**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

Defined in: [tools/analyzeCountryDelegation.ts:300](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/tools/analyzeCountryDelegation.ts#L300)

Handles the analyze_country_delegation MCP tool request.

Analyses an EU member state's MEP delegation in the European Parliament, covering
political group distribution, aggregate voting behaviour, committee presence, and a
national cohesion score. Reveals national interest patterns that can cut across
political group lines, supporting targeted government-affairs advocacy.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [AnalyzeCountryDelegationSchema](../variables/AnalyzeCountryDelegationSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

MCP tool result containing a CountryDelegationAnalysis object with
  delegation breakdown, computed attributes, confidence level, and methodology note

## Throws

If `args` fails schema validation (e.g., missing required `country`, non-uppercase code)

## Throws

If the European Parliament API is unreachable or returns an error response

## Example

```typescript
const result = await handleAnalyzeCountryDelegation({
  country: 'SE',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});
// Returns political group distribution, voting behaviour, and cohesion score for Sweden's MEPs
```

## Security

Input is validated with Zod before any API call.
  Country code is validated against a strict regex to prevent injection.
  Personal data in responses is minimised per GDPR Article 5(1)(c).
  All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [analyzeCountryDelegationToolMetadata](../variables/analyzeCountryDelegationToolMetadata.md) for MCP schema registration
 - handleAnalyzeCommitteeActivity for per-committee workload analysis
