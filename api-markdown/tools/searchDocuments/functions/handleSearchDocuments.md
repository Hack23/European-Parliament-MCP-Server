[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/searchDocuments](../README.md) / handleSearchDocuments

# Function: handleSearchDocuments()

> **handleSearchDocuments**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/searchDocuments.ts:64](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/searchDocuments.ts#L64)

Handles the search_documents MCP tool request.

Searches European Parliament legislative documents by keyword and optional filters, or
retrieves a single document by `docId`. Supports filtering by document type, date range,
and responsible committee. Returned document metadata includes titles, authors, status,
and links to PDF/XML versions.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [SearchDocumentsSchema](../../../schemas/ep/document/variables/SearchDocumentsSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing matching legislative documents or a single document

## Throws

- If `args` fails schema validation (e.g., keyword exceeds 200 chars, bad date format)
- If the European Parliament API is unreachable or returns an error response

## Example

```typescript
// Full-text keyword search with filters
const result = await handleSearchDocuments({
  keyword: 'climate change',
  documentType: 'REPORT',
  dateFrom: '2024-01-01',
  limit: 20
});
// Returns up to 20 EP reports matching "climate change" from 2024 onwards

// Single document lookup by ID
const doc = await handleSearchDocuments({ docId: 'A9-0234/2024' });
// Returns the full metadata for document A9-0234/2024
```

## Security

Input is validated with Zod before any API call.
  Keyword pattern is restricted to alphanumeric characters, spaces, hyphens, and underscores
  to prevent injection. Personal data in responses is minimised per GDPR Article 5(1)(c).
  All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [searchDocumentsToolMetadata](../variables/searchDocumentsToolMetadata.md) for MCP schema registration
 - handleGetExternalDocuments for non-EP (external) document retrieval
