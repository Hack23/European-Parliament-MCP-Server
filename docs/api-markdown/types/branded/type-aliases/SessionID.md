[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / SessionID

# Type Alias: SessionID

> **SessionID** = [`Brand`](Brand.md)\<`string`, `"SessionID"`\>

Defined in: [types/branded.ts:59](https://github.com/Hack23/European-Parliament-MCP-Server/blob/67dbd67a8f5629591a17b9785bfa0977f7023afb/src/types/branded.ts#L59)

Plenary Session ID

Format: Alphanumeric with hyphens (e.g., "P9-2024-11-20")
Source: European Parliament Open Data Portal

## Example

```typescript
const sessionId: SessionID = createSessionID("P9-2024-11-20");
const sessionData = await getPlenarySession(sessionId);
```
