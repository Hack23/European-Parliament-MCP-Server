[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/generateReport](../README.md) / handleGenerateReport

# Function: handleGenerateReport()

> **handleGenerateReport**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

Defined in: [tools/generateReport/index.ts:80](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/tools/generateReport/index.ts#L80)

Handles the generate_report MCP tool request.

Generates structured analytical intelligence reports on European Parliament data.
Supports four report types: MEP activity scorecards, committee performance
assessments, voting statistics summaries, and legislation progress reports.
Delegates to a type-keyed generator map for O(1) dispatch.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GenerateReportSchema](../../../schemas/ep/analysis/variables/GenerateReportSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

MCP tool result containing a structured report with summary, sections,
  statistics, and recommendations appropriate to the requested report type

## Throws

If `args` fails schema validation (e.g., missing required fields or invalid format)

## Throws

If the European Parliament API is unreachable or returns an error response

## Example

```typescript
const result = await handleGenerateReport({
  reportType: 'MEP_ACTIVITY',
  subjectId: 'MEP-124810',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});
// Returns MEP activity scorecard with voting discipline, attendance,
// committee contributions, and performance recommendations
```

## Security

Input is validated with Zod before any API call.
  Personal data in responses is minimised per GDPR Article 5(1)(c).
  All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [generateReportToolMetadata](../variables/generateReportToolMetadata.md) for MCP schema registration
 - handleTrackLegislation for per-procedure legislative progress tracking
