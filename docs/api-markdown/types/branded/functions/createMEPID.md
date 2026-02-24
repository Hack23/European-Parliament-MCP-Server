[**European Parliament MCP Server API v0.6.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / createMEPID

# Function: createMEPID()

> **createMEPID**(`value`): [`MEPID`](../type-aliases/MEPID.md)

Defined in: [types/branded.ts:213](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/branded.ts#L213)

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
