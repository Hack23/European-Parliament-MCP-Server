[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/timeout](../README.md) / withTimeout

# Function: withTimeout()

> **withTimeout**\<`T`\>(`promise`, `timeoutMs`, `errorMessage?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [utils/timeout.ts:96](https://github.com/Hack23/European-Parliament-MCP-Server/blob/67dbd67a8f5629591a17b9785bfa0977f7023afb/src/utils/timeout.ts#L96)

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
