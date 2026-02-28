[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getParliamentaryQuestions](../README.md) / handleGetParliamentaryQuestions

# Function: handleGetParliamentaryQuestions()

> **handleGetParliamentaryQuestions**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getParliamentaryQuestions.ts:57](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getParliamentaryQuestions.ts#L57)

Handles the get_parliamentary_questions MCP tool request.

Retrieves European Parliament questions (written and oral) submitted by MEPs,
with optional single-question lookup by docId or list filtering by type, author,
topic, status, and date range.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetParliamentaryQuestionsSchema](../../../schemas/ep/question/variables/GetParliamentaryQuestionsSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing either a single question record or a paginated list of parliamentary questions

## Throws

- If `args` fails schema validation (e.g., missing required fields or invalid format)
- If the European Parliament API is unreachable or returns an error response

## Example

```typescript
// List answered written questions on climate policy
const result = await handleGetParliamentaryQuestions({
  type: 'WRITTEN',
  status: 'ANSWERED',
  topic: 'climate policy',
  limit: 20
});
// Returns up to 20 answered written questions matching the topic

// Single question lookup
const single = await handleGetParliamentaryQuestions({ docId: 'E-000001/2024' });
// Returns the full record for the specified question
```

## Security

- Input is validated with Zod before any API call.
- Personal data in responses is minimised per GDPR Article 5(1)(c).
- All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [getParliamentaryQuestionsToolMetadata](../variables/getParliamentaryQuestionsToolMetadata.md) for MCP schema registration
 - handleGetVotingRecords for retrieving plenary voting data
