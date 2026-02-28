[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getExternalDocuments](../README.md) / handleGetExternalDocuments

# Function: handleGetExternalDocuments()

> **handleGetExternalDocuments**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getExternalDocuments.ts:55](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getExternalDocuments.ts#L55)

Handles the get_external_documents MCP tool request.

Retrieves external documents (non-EP documents such as Council positions and Commission
proposals) from the European Parliament data portal. Supports both a paginated list view
and a single-document lookup when `docId` is provided.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetExternalDocumentsSchema](../../../schemas/ep/document/variables/GetExternalDocumentsSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing external document data (single document or paginated list)

## Throws

- If `args` fails schema validation (e.g., invalid field types or formats)
- If the European Parliament API is unreachable or returns an error response

## Example

```typescript
// Single document lookup
const single = await handleGetExternalDocuments({ docId: 'COM-2024-123' });
// Returns the external document with ID COM-2024-123

// List documents filtered by year
const list = await handleGetExternalDocuments({ year: 2024, limit: 30, offset: 0 });
// Returns up to 30 external documents from 2024
```

## Security

- Input is validated with Zod before any API call.
- Personal data in responses is minimised per GDPR Article 5(1)(c).
- All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [getExternalDocumentsToolMetadata](../variables/getExternalDocumentsToolMetadata.md) for MCP schema registration
 - handleSearchDocuments for full-text search across EP legislative documents
