[**European Parliament MCP Server API v0.9.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getPlenarySessionDocumentItems](../README.md) / handleGetPlenarySessionDocumentItems

# Function: handleGetPlenarySessionDocumentItems()

> **handleGetPlenarySessionDocumentItems**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getPlenarySessionDocumentItems.ts:46](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getPlenarySessionDocumentItems.ts#L46)

Handles the get_plenary_session_document_items MCP tool request.

Retrieves individual items within European Parliament plenary session documents,
enabling granular access to specific agenda or document entries within a session.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetPlenarySessionDocumentItemsSchema](../../../schemas/ep/document/variables/GetPlenarySessionDocumentItemsSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing a paginated list of plenary session document items

## Throws

- If `args` fails schema validation (e.g., missing required fields or invalid format)
- If the European Parliament API is unreachable or returns an error response

## Example

```typescript
const result = await handleGetPlenarySessionDocumentItems({ limit: 20, offset: 0 });
// Returns up to 20 plenary session document items from the EP Open Data Portal
```

## Security

- Input is validated with Zod before any API call.
- Personal data in responses is minimised per GDPR Article 5(1)(c).
- All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [getPlenarySessionDocumentItemsToolMetadata](../variables/getPlenarySessionDocumentItemsToolMetadata.md) for MCP schema registration
 - handleGetAdoptedTexts for retrieving finalized plenary documents
