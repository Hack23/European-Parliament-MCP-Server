[**European Parliament MCP Server API v0.7.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / isCommitteeID

# Function: isCommitteeID()

> **isCommitteeID**(`value`): `value is CommitteeID`

Defined in: [types/branded.ts:154](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/types/branded.ts#L154)

Type guard to check if a string is a valid Committee ID

## Parameters

### value

`string`

String to validate

## Returns

`value is CommitteeID`

true if the value matches Committee ID format

## Example

```typescript
if (isCommitteeID("DEVE")) {
  const id = "DEVE" as CommitteeID;
}
```
