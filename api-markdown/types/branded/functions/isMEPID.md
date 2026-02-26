[**European Parliament MCP Server API v0.8.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / isMEPID

# Function: isMEPID()

> **isMEPID**(`value`): `value is MEPID`

Defined in: [types/branded.ts:118](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/types/branded.ts#L118)

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
