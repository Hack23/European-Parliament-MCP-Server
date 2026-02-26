[**European Parliament MCP Server API v0.8.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / MEPID

# Type Alias: MEPID

> **MEPID** = [`Brand`](Brand.md)\<`string`, `"MEPID"`\>

Defined in: [types/branded.ts:45](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/types/branded.ts#L45)

MEP ID - unique identifier for Members of European Parliament

Format: Numeric string (e.g., "124936")
Source: European Parliament Open Data Portal

## Example

```typescript
const mepId: MEPID = createMEPID("124936");
const mepDetails = await getMEPDetails(mepId);
```
