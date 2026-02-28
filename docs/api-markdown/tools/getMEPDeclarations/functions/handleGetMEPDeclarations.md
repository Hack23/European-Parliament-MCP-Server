[**European Parliament MCP Server API v0.9.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getMEPDeclarations](../README.md) / handleGetMEPDeclarations

# Function: handleGetMEPDeclarations()

> **handleGetMEPDeclarations**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getMEPDeclarations.ts:59](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getMEPDeclarations.ts#L59)

Handles the get_mep_declarations MCP tool request.

Retrieves MEP declarations of financial interests filed under the Rules of Procedure.
Supports both single-declaration lookup by document ID and list retrieval with optional
year filtering. Financial declaration data enables conflict-of-interest detection,
lobbying pattern analysis, and transparency assessments.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetMEPDeclarationsSchema](../../../schemas/ep/activities/variables/GetMEPDeclarationsSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing either a single MEP financial declaration document
  or a paginated list of declarations, optionally filtered by filing year

## Throws

- If `args` fails schema validation (e.g., invalid year or limit
  out of range 1–100)
- If the European Parliament API is unreachable or returns an error response

## Example

```typescript
// List declarations for a specific year
const result = await handleGetMEPDeclarations({ year: 2024, limit: 20 });
// Returns up to 20 financial declarations filed in 2024

// Fetch a single declaration by document ID
const single = await handleGetMEPDeclarations({ docId: 'DECL-2024-001' });
// Returns the full declaration document
```

## Security

- Input is validated with Zod before any API call.
- Access to financial declarations (personal data) is audit-logged per GDPR Art. 6(1)(e)
  and ISMS Policy AU-002. Data minimisation applied per GDPR Article 5(1)(c).

## Since

0.8.0

## See

 - [getMEPDeclarationsToolMetadata](../variables/getMEPDeclarationsToolMetadata.md) for MCP schema registration
 - handleGetMEPDetails for retrieving broader MEP profile information
