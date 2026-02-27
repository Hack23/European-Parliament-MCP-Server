[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getHomonymMEPs](../README.md) / handleGetHomonymMEPs

# Function: handleGetHomonymMEPs()

> **handleGetHomonymMEPs**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getHomonymMEPs.ts:48](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getHomonymMEPs.ts#L48)

Handles the get_homonym_meps MCP tool request.

Retrieves Members of European Parliament who share identical names with other MEPs in the
current parliamentary term. Essential for disambiguation in data matching, identity
resolution pipelines, and intelligence analysis workflows where name collisions could
produce incorrect entity linkage.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetHomonymMEPsSchema](../../../schemas/ep/mep/variables/GetHomonymMEPsSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing a paginated list of MEP records with homonymous names

## Throws

- If `args` fails schema validation (e.g., limit out of range 1–100)
- If the European Parliament API is unreachable or returns an error response

## Example

```typescript
const result = await handleGetHomonymMEPs({ limit: 50, offset: 0 });
// Returns MEPs who share a name with at least one other MEP in the current term
```

## Security

- Input is validated with Zod before any API call.
- Personal data in responses is minimised per GDPR Article 5(1)(c).
- All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [getHomonymMEPsToolMetadata](../variables/getHomonymMEPsToolMetadata.md) for MCP schema registration
 - handleGetMEPDetails for disambiguating a specific MEP by unique ID
