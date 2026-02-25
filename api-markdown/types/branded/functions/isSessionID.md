[**European Parliament MCP Server API v0.8.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / isSessionID

# Function: isSessionID()

> **isSessionID**(`value`): `value is SessionID`

Defined in: [types/branded.ts:136](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/types/branded.ts#L136)

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
