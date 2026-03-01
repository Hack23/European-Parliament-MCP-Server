[**European Parliament MCP Server API v1.0.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getPlenarySessionDocuments](../README.md) / handleGetPlenarySessionDocuments

# Function: handleGetPlenarySessionDocuments()

> **handleGetPlenarySessionDocuments**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getPlenarySessionDocuments.ts:57](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getPlenarySessionDocuments.ts#L57)

Handles the get_plenary_session_documents MCP tool request.

Retrieves European Parliament plenary session documents such as agendas, minutes, and
voting lists. Supports both single-document lookup by document ID and paginated list
retrieval. Core data source for parliamentary activity monitoring and meeting intelligence.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetPlenarySessionDocumentsSchema](../../../schemas/ep/document/variables/GetPlenarySessionDocumentsSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing either a single plenary session document (when `docId`
  is provided) or a paginated list of session documents including agendas, minutes, and
  voting lists

## Throws

- If `args` fails schema validation (e.g., limit out of range 1–100)
- If the European Parliament API is unreachable or returns an error response

## Example

```typescript
// List the most recent session documents
const result = await handleGetPlenarySessionDocuments({ limit: 10, offset: 0 });
// Returns up to 10 plenary session documents (agendas, minutes, voting lists)

// Fetch a single session document by ID
const single = await handleGetPlenarySessionDocuments({ docId: 'SESS-DOC-2024-042' });
// Returns the full session document record
```

## Security

- Input is validated with Zod before any API call.
- Personal data in responses is minimised per GDPR Article 5(1)(c).
- All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [getPlenarySessionDocumentsToolMetadata](../variables/getPlenarySessionDocumentsToolMetadata.md) for MCP schema registration
 - handleGetPlenarySessions for the sessions these documents belong to
 - handleGetPlenaryDocuments for broader legislative plenary documents
