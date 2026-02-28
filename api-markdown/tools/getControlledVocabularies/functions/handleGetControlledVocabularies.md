[**European Parliament MCP Server API v0.9.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getControlledVocabularies](../README.md) / handleGetControlledVocabularies

# Function: handleGetControlledVocabularies()

> **handleGetControlledVocabularies**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getControlledVocabularies.ts:55](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getControlledVocabularies.ts#L55)

Handles the get_controlled_vocabularies MCP tool request.

Retrieves European Parliament controlled vocabularies—standardised classification terms
used across EP datasets. Supports both a paginated list view and a single-vocabulary
lookup when `vocId` is provided. These vocabularies are essential for accurate query
construction and data interpretation across other EP API tools.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetControlledVocabulariesSchema](../../../schemas/ep/activities/variables/GetControlledVocabulariesSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing vocabulary data (single vocabulary or paginated list)

## Throws

- If `args` fails schema validation (e.g., invalid field types or formats)
- If the European Parliament API is unreachable or returns an error response

## Example

```typescript
// Single vocabulary lookup
const single = await handleGetControlledVocabularies({ vocId: 'activities-type' });
// Returns the controlled vocabulary for activity types

// List all vocabularies
const list = await handleGetControlledVocabularies({ limit: 50, offset: 0 });
// Returns up to 50 controlled vocabulary entries
```

## Security

- Input is validated with Zod before any API call.
- Personal data in responses is minimised per GDPR Article 5(1)(c).
- All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [getControlledVocabulariesToolMetadata](../variables/getControlledVocabulariesToolMetadata.md) for MCP schema registration
 - handleSearchDocuments for tools that consume vocabulary terms as filter values
