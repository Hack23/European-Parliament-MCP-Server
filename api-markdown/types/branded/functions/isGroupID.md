[**European Parliament MCP Server API v0.8.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / isGroupID

# Function: isGroupID()

> **isGroupID**(`value`): `value is GroupID`

Defined in: [types/branded.ts:190](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/types/branded.ts#L190)

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
