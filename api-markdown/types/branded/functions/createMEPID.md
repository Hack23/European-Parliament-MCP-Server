[**European Parliament MCP Server API v0.8.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / createMEPID

# Function: createMEPID()

> **createMEPID**(`value`): [`MEPID`](../type-aliases/MEPID.md)

Defined in: [types/branded.ts:213](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/types/branded.ts#L213)

Factory function to create a validated MEP ID

## Parameters

### value

`string`

String to convert to MEP ID

## Returns

[`MEPID`](../type-aliases/MEPID.md)

Branded MEP ID

## Throws

If value is not a valid MEP ID format

## Example

```typescript
const mepId = createMEPID("124936");
const details = await getMEPDetails(mepId);
```

## Security

Input validation prevents injection attacks
