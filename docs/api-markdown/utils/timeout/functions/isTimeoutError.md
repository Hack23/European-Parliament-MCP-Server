[**European Parliament MCP Server API v0.8.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/timeout](../README.md) / isTimeoutError

# Function: isTimeoutError()

> **isTimeoutError**(`error`): `error is TimeoutError`

Defined in: [utils/timeout.ts:334](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/utils/timeout.ts#L334)

Type guard to check if an error is a TimeoutError

## Parameters

### error

`unknown`

Error to check

## Returns

`error is TimeoutError`

true if error is a TimeoutError

## Example

```typescript
try {
  await withTimeout(operation(), 5000);
} catch (error) {
  if (isTimeoutError(error)) {
    console.error('Operation timed out:', error.timeoutMs);
  }
}
```
