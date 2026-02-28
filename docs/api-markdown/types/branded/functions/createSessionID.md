[**European Parliament MCP Server API v0.9.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / createSessionID

# Function: createSessionID()

> **createSessionID**(`value`): [`SessionID`](../type-aliases/SessionID.md)

Defined in: [types/branded.ts:235](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/branded.ts#L235)

Factory function to create a validated Session ID

## Parameters

### value

`string`

String to convert to Session ID

## Returns

[`SessionID`](../type-aliases/SessionID.md)

Branded Session ID

## Throws

If value is not a valid Session ID format

## Example

```typescript
const sessionId = createSessionID("P9-2024-11-20");
const session = await getPlenarySession(sessionId);
```

## Security

Input validation prevents injection attacks
