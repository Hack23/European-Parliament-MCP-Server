[**European Parliament MCP Server API v0.7.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / SessionID

# Type Alias: SessionID

> **SessionID** = [`Brand`](Brand.md)\<`string`, `"SessionID"`\>

Defined in: [types/branded.ts:59](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/branded.ts#L59)

Plenary Session ID

Format: Alphanumeric with hyphens (e.g., "P9-2024-11-20")
Source: European Parliament Open Data Portal

## Example

```typescript
const sessionId: SessionID = createSessionID("P9-2024-11-20");
const sessionData = await getPlenarySession(sessionId);
```
