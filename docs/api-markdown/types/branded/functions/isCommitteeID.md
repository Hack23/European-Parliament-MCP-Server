[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / isCommitteeID

# Function: isCommitteeID()

> **isCommitteeID**(`value`): `value is CommitteeID`

Defined in: [types/branded.ts:154](https://github.com/Hack23/European-Parliament-MCP-Server/blob/006b62840b740489118388cc87b431ee92a42c24/src/types/branded.ts#L154)

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
