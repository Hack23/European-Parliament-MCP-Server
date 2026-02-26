[**European Parliament MCP Server API v0.8.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / isSessionID

# Function: isSessionID()

> **isSessionID**(`value`): `value is SessionID`

Defined in: [types/branded.ts:136](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/types/branded.ts#L136)

Type guard to check if a string is a valid Session ID

## Parameters

### value

`string`

String to validate

## Returns

`value is SessionID`

true if the value matches Session ID format

## Example

```typescript
if (isSessionID("P9-2024-11-20")) {
  const id = "P9-2024-11-20" as SessionID;
}
```
