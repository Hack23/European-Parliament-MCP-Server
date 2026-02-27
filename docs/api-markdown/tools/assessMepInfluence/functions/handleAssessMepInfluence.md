[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/assessMepInfluence](../README.md) / handleAssessMepInfluence

# Function: handleAssessMepInfluence()

> **handleAssessMepInfluence**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/assessMepInfluence.ts:264](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/assessMepInfluence.ts#L264)

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

## Example

```typescript
const result = await handleAssessMepInfluence({
  mepId: '124810',
  includeVoting: true,
  includeCommittees: true
});
// Returns influence assessment with overall score, voting discipline,
// committee leadership, and seniority breakdown
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
