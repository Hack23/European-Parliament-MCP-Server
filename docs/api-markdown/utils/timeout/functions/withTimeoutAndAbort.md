[**European Parliament MCP Server API v0.7.3**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/timeout](../README.md) / withTimeoutAndAbort

# Function: withTimeoutAndAbort()

> **withTimeoutAndAbort**\<`T`\>(`fn`, `timeoutMs`, `errorMessage?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [utils/timeout.ts:120](https://github.com/Hack23/European-Parliament-MCP-Server/blob/c844f163befb571516b5718c5d197eff1e589dea/src/utils/timeout.ts#L120)

Wraps a promise with a timeout and optional AbortSignal support.

For operations that support cancellation (like fetch), pass a function that
accepts an AbortSignal. The signal will be aborted when the timeout fires,
allowing the underlying operation to clean up resources.

## Type Parameters

### T

`T`

Type of the promise result

## Parameters

### fn

(`signal`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Function that returns a promise and optionally accepts an AbortSignal

### timeoutMs

`number`

Timeout in milliseconds

### errorMessage?

`string`

Custom error message (optional)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Promise that resolves/rejects with the operation result or timeout

## Example

```typescript
// With AbortSignal support (for fetch, etc.)
await withTimeoutAndAbort(
  (signal) => fetch(url, { signal }),
  5000,
  'API request timed out'
);
```
