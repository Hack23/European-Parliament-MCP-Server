[**European Parliament MCP Server API v1.0.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getCommitteeDocuments](../README.md) / handleGetCommitteeDocuments

# Function: handleGetCommitteeDocuments()

> **handleGetCommitteeDocuments**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getCommitteeDocuments.ts:53](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getCommitteeDocuments.ts#L53)

Handles the get_committee_documents MCP tool request.

Retrieves European Parliament committee documents, supporting single document
lookup by docId or a paginated list optionally filtered by year.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetCommitteeDocumentsSchema](../../../schemas/ep/document/variables/GetCommitteeDocumentsSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing either a single committee document or a paginated list of documents

## Throws

- If `args` fails schema validation (e.g., missing required fields or invalid format)
- If the European Parliament API is unreachable or returns an error response

## Example

```typescript
// Single document lookup
const result = await handleGetCommitteeDocuments({ docId: 'A9-0001/2024' });
// Returns the full record for the specified committee document

// List documents filtered by year
const list = await handleGetCommitteeDocuments({ year: 2024, limit: 25 });
// Returns up to 25 committee documents from 2024
```

## Security

- Input is validated with Zod before any API call.
- Personal data in responses is minimised per GDPR Article 5(1)(c).
- All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [getCommitteeDocumentsToolMetadata](../variables/getCommitteeDocumentsToolMetadata.md) for MCP schema registration
 - handleGetCommitteeInfo for retrieving committee membership and structure
