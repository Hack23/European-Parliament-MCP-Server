[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getAdoptedTexts](../README.md) / handleGetAdoptedTexts

# Function: handleGetAdoptedTexts()

> **handleGetAdoptedTexts**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getAdoptedTexts.ts:56](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/tools/getAdoptedTexts.ts#L56)

Handles the get_adopted_texts MCP tool request.

Retrieves European Parliament adopted texts, including legislative resolutions,
first-reading positions, and non-legislative resolutions. Supports single document
lookup by docId or a paginated list optionally filtered by year.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetAdoptedTextsSchema](../../../schemas/ep/activities/variables/GetAdoptedTextsSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing either a single adopted text or a paginated list of adopted texts

## Throws

If `args` fails schema validation (e.g., missing required fields or invalid format)

## Throws

If the European Parliament API is unreachable or returns an error response

## Example

```typescript
// Single adopted text lookup
const result = await handleGetAdoptedTexts({ docId: 'P9-TA(2024)0001' });
// Returns the full record for the specified adopted text

// List adopted texts from 2024
const list = await handleGetAdoptedTexts({ year: 2024, limit: 50 });
// Returns up to 50 adopted texts from 2024
```

## Security

Input is validated with Zod before any API call.
  Personal data in responses is minimised per GDPR Article 5(1)(c).
  All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [getAdoptedTextsToolMetadata](../variables/getAdoptedTextsToolMetadata.md) for MCP schema registration
 - handleGetPlenarySessionDocumentItems for retrieving in-session document items
