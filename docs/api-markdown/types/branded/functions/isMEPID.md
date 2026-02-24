[**European Parliament MCP Server API v0.6.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / isMEPID

# Function: isMEPID()

> **isMEPID**(`value`): `value is MEPID`

Defined in: [types/branded.ts:118](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/branded.ts#L118)

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
