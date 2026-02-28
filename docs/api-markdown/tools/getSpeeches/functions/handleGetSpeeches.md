[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getSpeeches](../README.md) / handleGetSpeeches

# Function: handleGetSpeeches()

> **handleGetSpeeches**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getSpeeches.ts:55](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getSpeeches.ts#L55)

Handles the get_speeches MCP tool request.

Retrieves European Parliament plenary speeches and debate contributions.
Supports single speech lookup by speechId or a filtered list by date range.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetSpeechesSchema](../../../schemas/ep/activities/variables/GetSpeechesSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing either a single speech record or a paginated list of speeches

## Throws

- If `args` fails schema validation (e.g., missing required fields or invalid format)
- If the European Parliament API is unreachable or returns an error response

## Example

```typescript
// Single speech lookup
const result = await handleGetSpeeches({ speechId: 'SPEECH-2024-001' });
// Returns the full record for the specified speech

// List speeches with date filter
const list = await handleGetSpeeches({ dateFrom: '2024-01-01', dateTo: '2024-03-31', limit: 50 });
// Returns up to 50 speeches from Q1 2024
```

## Security

- Input is validated with Zod before any API call.
- Personal data in responses is minimised per GDPR Article 5(1)(c).
- All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [getSpeechesToolMetadata](../variables/getSpeechesToolMetadata.md) for MCP schema registration
 - handleGetMeetingActivities for retrieving broader meeting-level activities
