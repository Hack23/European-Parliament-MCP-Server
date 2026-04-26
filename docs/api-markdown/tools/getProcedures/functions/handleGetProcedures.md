[**European Parliament MCP Server API v1.2.15**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getProcedures](../README.md) / handleGetProcedures

# Function: handleGetProcedures()

> **handleGetProcedures**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getProcedures.ts:63](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getProcedures.ts#L63)

Handles the get_procedures MCP tool request.

Retrieves European Parliament legislative procedures enabling end-to-end legislative
tracking, outcome prediction, and timeline analysis. Supports both a single-procedure
lookup by `processId` and a paginated list.

Note: The EP API `/procedures` endpoint does **not** support `year` filtering.
Only `process-type` is available.  Callers needing year-specific counts
must filter client-side.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetProceduresSchema](../../../schemas/ep/activities/variables/GetProceduresSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing procedure data (single procedure or paginated list)

## Throws

- If `args` fails schema validation (e.g., invalid field types or formats)
- If the European Parliament API is unreachable or returns an error response

## Example

```typescript
// Single procedure lookup
const single = await handleGetProcedures({ processId: '2023/0132(COD)' });
// Returns the legislative procedure for the Artificial Intelligence Act

// List procedures (no year filter available in the EP API)
const list = await handleGetProcedures({ limit: 50, offset: 0 });
// Returns up to 50 legislative procedures
```

## Security

- Input is validated with Zod before any API call.
- Personal data in responses is minimised per GDPR Article 5(1)(c).
- All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [getProceduresToolMetadata](../variables/getProceduresToolMetadata.md) for MCP schema registration
 - handleGetProcedureEvents for retrieving events linked to a specific procedure
