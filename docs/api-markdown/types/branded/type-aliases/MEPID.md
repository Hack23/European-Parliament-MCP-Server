[**European Parliament MCP Server API v0.8.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / MEPID

# Type Alias: MEPID

> **MEPID** = [`Brand`](Brand.md)\<`string`, `"MEPID"`\>

Defined in: [types/branded.ts:45](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/types/branded.ts#L45)

MEP ID - unique identifier for Members of European Parliament

Format: Numeric string (e.g., "124936")
Source: European Parliament Open Data Portal

## Example

```typescript
const mepId: MEPID = createMEPID("124936");
const mepDetails = await getMEPDetails(mepId);
```
