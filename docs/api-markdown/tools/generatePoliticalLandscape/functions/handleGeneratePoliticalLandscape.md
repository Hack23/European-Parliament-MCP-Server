[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/generatePoliticalLandscape](../README.md) / handleGeneratePoliticalLandscape

# Function: handleGeneratePoliticalLandscape()

> **handleGeneratePoliticalLandscape**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

Defined in: [tools/generatePoliticalLandscape.ts:295](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/tools/generatePoliticalLandscape.ts#L295)

Handles the generate_political_landscape MCP tool request.

Generates a comprehensive snapshot of the current European Parliament political
landscape including group seat shares, bloc analysis (progressive vs. conservative),
coalition viability, and power-balance metrics. Provides single-call situational
awareness for strategic intelligence briefings.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GeneratePoliticalLandscapeSchema](../variables/GeneratePoliticalLandscapeSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

MCP tool result containing group seat distributions, power dynamics,
  activity metrics, fragmentation index, majority type, and political balance score

## Throws

If `args` fails schema validation (e.g., missing required fields or invalid format)

## Throws

If the European Parliament API is unreachable or returns an error response

## Example

```typescript
const result = await handleGeneratePoliticalLandscape({
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});
// Returns full landscape with group sizes, bloc analysis,
// fragmentation index, and majority-type classification
```

## Security

Input is validated with Zod before any API call.
  Personal data in responses is minimised per GDPR Article 5(1)(c).
  All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [generatePoliticalLandscapeToolMetadata](../variables/generatePoliticalLandscapeToolMetadata.md) for MCP schema registration
 - handleComparePoliticalGroups for detailed per-group dimension comparison
