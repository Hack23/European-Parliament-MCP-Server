[**European Parliament MCP Server API v1.0.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getMeetingPlenarySessionDocuments](../README.md) / handleGetMeetingPlenarySessionDocuments

# Function: handleGetMeetingPlenarySessionDocuments()

> **handleGetMeetingPlenarySessionDocuments**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getMeetingPlenarySessionDocuments.ts:68](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getMeetingPlenarySessionDocuments.ts#L68)

Handle the `get_meeting_plenary_session_documents` MCP tool request.

Retrieves all plenary session documents associated with a specific EP plenary
sitting by calling `GET /meetings/{sitting-id}/plenary-session-documents` via
[epClient](../../../clients/europeanParliamentClient/variables/epClient.md). The raw API response is normalised into a standardised
[ToolResult](../../shared/types/interfaces/ToolResult.md) using [buildToolResponse](../../shared/responseBuilder/functions/buildToolResponse.md).

## Parameters

### args

`unknown`

Raw tool arguments provided by the MCP client. Must conform to
  [GetMeetingPlenarySessionDocumentsSchema](../../../schemas/ep/activities/variables/GetMeetingPlenarySessionDocumentsSchema.md):
  - `sittingId` (string, required): EP plenary sitting identifier.
  - `limit` (number, optional): Maximum results to return (1–100, default 50).
  - `offset` (number, optional): Pagination offset (default 0).

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

A promise that resolves to an MCP [ToolResult](../../shared/types/interfaces/ToolResult.md) containing the
  plenary session documents for the requested sitting.

## Throws

If `args` fails [GetMeetingPlenarySessionDocumentsSchema](../../../schemas/ep/activities/variables/GetMeetingPlenarySessionDocumentsSchema.md) validation
  (e.g. missing required `sittingId` or out-of-range `limit`).

## Throws

If `sittingId` contains path-traversal characters (`.`, `\`, `?`, `#`)
  — the underlying client throws an `APIError(400)`.

## Throws

If the European Parliament API is unreachable or returns an error response.

## Example

```typescript
const result = await handleGetMeetingPlenarySessionDocuments({
  sittingId: 'PV-9-2024-04-22',
  limit: 20,
  offset: 0
});
// Returns plenary session documents for sitting PV-9-2024-04-22
```

## Security

Input is validated with Zod before any API call.
  `sittingId` is checked against path-traversal characters before URL construction.
  Personal data in responses is minimised per GDPR Article 5(1)(c).
  All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

1.0.0

## See

 - [getMeetingPlenarySessionDocumentsToolMetadata](../variables/getMeetingPlenarySessionDocumentsToolMetadata.md) for MCP schema registration
 - handleGetMeetingPlenarySessionDocumentItems for individual agenda-item documents
 - handleGetMeetingForeseenActivities for planned meeting activities
