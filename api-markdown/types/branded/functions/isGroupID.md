[**European Parliament MCP Server API v0.9.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / isGroupID

# Function: isGroupID()

> **isGroupID**(`value`): `value is GroupID`

Defined in: [types/branded.ts:190](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/branded.ts#L190)

Type guard to check if a string is a valid Political Group ID

## Parameters

### value

`string`

String to validate

## Returns

`value is GroupID`

true if the value matches Group ID format

## Example

```typescript
if (isGroupID("EPP")) {
  const id = "EPP" as GroupID;
}
```
