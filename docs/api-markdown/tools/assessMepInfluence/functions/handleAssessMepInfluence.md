[**European Parliament MCP Server API v0.9.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/assessMepInfluence](../README.md) / handleAssessMepInfluence

# Function: handleAssessMepInfluence()

> **handleAssessMepInfluence**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/assessMepInfluence.ts:311](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/assessMepInfluence.ts#L311)

Handles the assess_mep_influence MCP tool request.

Assesses an MEP's influence within the European Parliament by evaluating their
voting activity, parliamentary questions, committee leadership roles, and
seniority. Produces a multi-dimensional influence score with network centrality
and impact rank computations.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [AssessMepInfluenceSchema](../../../schemas/ep/analysis/variables/AssessMepInfluenceSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing the MEP's influence scores, voting statistics,
  committee roles, question count, seniority metrics, and computed influence rank

## Throws

- If `args` fails schema validation (e.g., missing required fields or invalid format)
- If the European Parliament API is unreachable or returns an error response

## Examples

```typescript
const result = await handleAssessMepInfluence({
  mepId: '124810',
  includeVoting: true,
  includeCommittees: true
});
// Returns influence assessment with overall score, voting discipline,
// committee leadership, and seniority breakdown
```

```typescript
// Basic influence assessment
const result = await handleAssessMepInfluence({ mepId: "197558" });
const assessment = JSON.parse(result.content[0].text);
console.log(`${assessment.mepName}: ${assessment.rank} (${assessment.overallScore}/100)`);
```

```typescript
// Detailed assessment with dimension breakdown
const result = await handleAssessMepInfluence({
  mepId: "197558",
  dateFrom: "2024-01-01",
  dateTo: "2024-12-31",
  includeDetails: true
});
```

## Security

- Input is validated with Zod before any API call.
- Personal data in responses is minimised per GDPR Article 5(1)(c).
- All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [assessMepInfluenceToolMetadata](../variables/assessMepInfluenceToolMetadata.md) for MCP schema registration
 - handleTrackMepAttendance for MEP attendance and participation tracking
Assess MEP influence tool handler

Computes a composite influence scorecard for a single MEP using a
5-dimension weighted model aligned with CIA Political Scorecards methodology.
Fetches live MEP profile and parliamentary questions from the EP Open Data API
to populate the scoring dimensions.

**Dimensions (weighted):**
- Voting Activity (25%) — attendance rate + participation volume
- Legislative Output (25%) — rapporteurships + committee leadership roles
- Committee Engagement (20%) — membership breadth + leadership positions
- Parliamentary Oversight (15%) — parliamentary questions filed
- Coalition Building (15%) — cross-party voting rate + engagement rate

## Throws

When MEP is not found or the EP API request fails

## Throws

When input fails schema validation (missing mepId, invalid date format)

## Security

Input validated by Zod. Errors sanitized (no stack traces exposed).
Personal data (MEP profiles) access logged per GDPR Article 30.
ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
