[**European Parliament MCP Server API v0.8.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/timeout](../README.md) / isTimeoutError

# Function: isTimeoutError()

> **isTimeoutError**(`error`): `error is TimeoutError`

Defined in: [utils/timeout.ts:334](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/utils/timeout.ts#L334)

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
