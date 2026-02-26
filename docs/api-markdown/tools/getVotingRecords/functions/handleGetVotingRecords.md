[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getVotingRecords](../README.md) / handleGetVotingRecords

# Function: handleGetVotingRecords()

> **handleGetVotingRecords**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

Defined in: [tools/getVotingRecords.ts:51](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/tools/getVotingRecords.ts#L51)

Handles the get_voting_records MCP tool request.

Retrieves voting records from European Parliament plenary sessions, supporting
filtering by session, MEP, topic, and date range. Returns vote tallies
(for/against/abstain), final results, and optionally individual MEP votes.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetVotingRecordsSchema](../../../schemas/ep/plenary/variables/GetVotingRecordsSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

MCP tool result containing a paginated list of voting records with vote counts and results

## Throws

If `args` fails schema validation (e.g., missing required fields or invalid format)

## Throws

If the European Parliament API is unreachable or returns an error response

## Example

```typescript
const result = await handleGetVotingRecords({
  sessionId: 'PLENARY-2024-01',
  topic: 'Climate Change',
  limit: 20
});
// Returns voting records for the January 2024 plenary session on climate topics
```

## Security

Input is validated with Zod before any API call.
  Personal data in responses is minimised per GDPR Article 5(1)(c).
  All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [getVotingRecordsToolMetadata](../variables/getVotingRecordsToolMetadata.md) for MCP schema registration
 - handleGetMeetingDecisions for retrieving decisions linked to a specific sitting
