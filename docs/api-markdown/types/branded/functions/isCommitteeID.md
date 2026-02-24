[**European Parliament MCP Server API v0.7.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / isCommitteeID

# Function: isCommitteeID()

> **isCommitteeID**(`value`): `value is CommitteeID`

Defined in: [types/branded.ts:154](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/branded.ts#L154)

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
