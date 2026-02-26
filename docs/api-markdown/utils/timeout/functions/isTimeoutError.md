[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/timeout](../README.md) / isTimeoutError

# Function: isTimeoutError()

> **isTimeoutError**(`error`): `error is TimeoutError`

Defined in: [utils/timeout.ts:344](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/utils/timeout.ts#L344)

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

## Since

0.8.0
