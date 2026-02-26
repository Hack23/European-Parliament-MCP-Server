[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / MEPID

# Type Alias: MEPID

> **MEPID** = [`Brand`](Brand.md)\<`string`, `"MEPID"`\>

Defined in: [types/branded.ts:45](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/branded.ts#L45)

MEP ID - unique identifier for Members of European Parliament

Format: Numeric string (e.g., "124936")
Source: European Parliament Open Data Portal

## Example

```typescript
const mepId: MEPID = createMEPID("124936");
const mepDetails = await getMEPDetails(mepId);
```
