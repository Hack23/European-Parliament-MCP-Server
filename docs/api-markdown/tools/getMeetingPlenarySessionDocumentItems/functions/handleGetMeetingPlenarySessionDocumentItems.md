[**European Parliament MCP Server API v0.9.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getMeetingPlenarySessionDocumentItems](../README.md) / handleGetMeetingPlenarySessionDocumentItems

# Function: handleGetMeetingPlenarySessionDocumentItems()

> **handleGetMeetingPlenarySessionDocumentItems**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getMeetingPlenarySessionDocumentItems.ts:69](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getMeetingPlenarySessionDocumentItems.ts#L69)

Handle the `get_meeting_plenary_session_document_items` MCP tool request.

Retrieves the individual agenda-item-level documents linked to a specific EP
plenary sitting by calling
`GET /meetings/{sitting-id}/plenary-session-document-items` via [epClient](../../../clients/europeanParliamentClient/variables/epClient.md).
The raw API response is normalised into a standardised [ToolResult](../../shared/types/interfaces/ToolResult.md)
using [buildToolResponse](../../shared/responseBuilder/functions/buildToolResponse.md).

## Parameters

### args

`unknown`

Raw tool arguments provided by the MCP client. Must conform to
  [GetMeetingPlenarySessionDocumentItemsSchema](../../../schemas/ep/activities/variables/GetMeetingPlenarySessionDocumentItemsSchema.md):
  - `sittingId` (string, required): EP plenary sitting identifier.
  - `limit` (number, optional): Maximum results to return (1–100, default 50).
  - `offset` (number, optional): Pagination offset (default 0).

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

A promise that resolves to an MCP [ToolResult](../../shared/types/interfaces/ToolResult.md) containing the
  plenary session document items for the requested sitting.

## Throws

If `args` fails [GetMeetingPlenarySessionDocumentItemsSchema](../../../schemas/ep/activities/variables/GetMeetingPlenarySessionDocumentItemsSchema.md) validation
  (e.g. missing required `sittingId` or out-of-range `limit`).

## Throws

If `sittingId` contains path-traversal characters (`.`, `\`, `?`, `#`)
  — the underlying client throws an `APIError(400)`.

## Throws

If the European Parliament API is unreachable or returns an error response.

## Example

```typescript
const result = await handleGetMeetingPlenarySessionDocumentItems({
  sittingId: 'PV-9-2024-04-22',
  limit: 50,
  offset: 0
});
// Returns individual agenda-item documents for plenary sitting PV-9-2024-04-22
```

## Security

Input is validated with Zod before any API call.
  `sittingId` is checked against path-traversal characters before URL construction.
  Personal data in responses is minimised per GDPR Article 5(1)(c).
  All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

1.0.0

## See

 - [getMeetingPlenarySessionDocumentItemsToolMetadata](../variables/getMeetingPlenarySessionDocumentItemsToolMetadata.md) for MCP schema registration
 - handleGetMeetingPlenarySessionDocuments for top-level session documents
 - handleGetMeetingForeseenActivities for planned meeting activities
