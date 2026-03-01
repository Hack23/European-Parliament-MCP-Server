[**European Parliament MCP Server API v1.0.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/timeout](../README.md) / withTimeoutAndAbort

# Function: withTimeoutAndAbort()

> **withTimeoutAndAbort**\<`T`\>(`fn`, `timeoutMs`, `errorMessage?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [utils/timeout.ts:156](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/timeout.ts#L156)

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

## Throws

If the operation exceeds `timeoutMs`

## Example

```typescript
// With AbortSignal support (for fetch, etc.)
await withTimeoutAndAbort(
  (signal) => fetch(url, { signal }),
  5000,
  'API request timed out'
);
```

## Security

Aborts the underlying operation via `AbortController` when the
  timeout fires, preventing dangling fetch connections and resource leaks.
  Per ISMS Policy SC-002, all external network calls must be cancellable.

## Since

0.8.0
