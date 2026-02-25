[**European Parliament MCP Server API v0.8.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/timeout](../README.md) / withTimeout

# Function: withTimeout()

> **withTimeout**\<`T`\>(`promise`, `timeoutMs`, `errorMessage?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [utils/timeout.ts:96](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/utils/timeout.ts#L96)

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
