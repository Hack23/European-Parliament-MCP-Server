[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / isMEPID

# Function: isMEPID()

> **isMEPID**(`value`): `value is MEPID`

Defined in: [types/branded.ts:118](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/branded.ts#L118)

Type guard to check if a string is a valid MEP ID

## Parameters

### value

`string`

String to validate

## Returns

`value is MEPID`

true if the value matches MEP ID format (numeric string)

## Example

```typescript
if (isMEPID("124936")) {
  const id = "124936" as MEPID;
}
```
