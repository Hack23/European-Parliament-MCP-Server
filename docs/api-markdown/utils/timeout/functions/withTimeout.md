[**European Parliament MCP Server API v0.7.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/timeout](../README.md) / withTimeout

# Function: withTimeout()

> **withTimeout**\<`T`\>(`promise`, `timeoutMs`, `errorMessage?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [utils/timeout.ts:67](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/utils/timeout.ts#L67)

Execute a promise with a timeout

Races the provided promise against a timeout. If the timeout expires
before the promise resolves, a TimeoutError is thrown.

## Type Parameters

### T

`T`

Type of the promise result

## Parameters

### promise

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Promise to execute with timeout

### timeoutMs

`number`

Timeout in milliseconds

### errorMessage?

`string`

Optional custom error message

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Promise that resolves with the result or rejects with TimeoutError

## Throws

If operation exceeds timeout

## Example

```typescript
const result = await withTimeout(
  fetchFromAPI('/endpoint'),
  5000,
  'API request timed out'
);
```

## Security

- Prevents resource exhaustion from hanging operations
- Ensures responsive API behavior
- Timeout values should be tuned per operation
