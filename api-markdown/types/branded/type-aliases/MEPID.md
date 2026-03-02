[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / MEPID

# Type Alias: MEPID

> **MEPID** = [`Brand`](Brand.md)\<`string`, `"MEPID"`\>

Defined in: [types/branded.ts:45](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/branded.ts#L45)

MEP ID - unique identifier for Members of European Parliament

Format: Numeric string (e.g., "124936")
Source: European Parliament Open Data Portal

## Example

```typescript
const mepId: MEPID = createMEPID("124936");
const mepDetails = await getMEPDetails(mepId);
```
