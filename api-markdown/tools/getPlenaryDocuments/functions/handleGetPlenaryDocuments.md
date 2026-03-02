[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getPlenaryDocuments](../README.md) / handleGetPlenaryDocuments

# Function: handleGetPlenaryDocuments()

> **handleGetPlenaryDocuments**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getPlenaryDocuments.ts:56](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getPlenaryDocuments.ts#L56)

Handles the get_plenary_documents MCP tool request.

Retrieves European Parliament plenary documents including legislative texts, reports, and
amendments. Supports both single-document lookup by document ID and list retrieval with
optional year filtering. Central to policy analysis and legislative tracking workflows.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetPlenaryDocumentsSchema](../../../schemas/ep/document/variables/GetPlenaryDocumentsSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing either a single plenary document (when `docId` is
  provided) or a paginated list of documents, optionally filtered by year

## Throws

- If `args` fails schema validation (e.g., limit out of range 1–100)
- If the European Parliament API is unreachable or returns an error response

## Example

```typescript
// List documents for a specific year
const result = await handleGetPlenaryDocuments({ year: 2024, limit: 25 });
// Returns up to 25 plenary documents from 2024

// Fetch a single document by ID
const single = await handleGetPlenaryDocuments({ docId: 'DOC-2024-001' });
// Returns the full plenary document record
```

## Security

- Input is validated with Zod before any API call.
- Personal data in responses is minimised per GDPR Article 5(1)(c).
- All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [getPlenaryDocumentsToolMetadata](../variables/getPlenaryDocumentsToolMetadata.md) for MCP schema registration
 - handleGetPlenarySessions for the sessions associated with these documents
 - handleGetPlenarySessionDocuments for session-level agendas and minutes
