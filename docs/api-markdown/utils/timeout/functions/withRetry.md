[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/timeout](../README.md) / withRetry

# Function: withRetry()

> **withRetry**\<`T`\>(`fn`, `options`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [utils/timeout.ts:274](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/timeout.ts#L274)

Execute a function with retry logic and timeout

Retries the operation up to options.maxRetries times (for a total
of maxRetries + 1 attempts including the initial call). Each retry has its
own timeout (if timeoutMs is provided).

By default, all non-[TimeoutError](../classes/TimeoutError.md) failures are considered retryable.
To restrict retries to transient failures only (for example, network
errors or 5xx status codes), provide a options.shouldRetry
predicate that returns true only for errors that should be retried.

## Type Parameters

### T

`T`

Type of the function result

## Parameters

### fn

() => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Async function to execute

### options

Retry and timeout configuration

#### maxRetries

`number`

Maximum number of retry attempts after the initial call

#### maxDelayMs?

`number`

Maximum delay cap in milliseconds (default: 30000); prevents unbounded backoff growth

#### retryDelayMs?

`number`

Base delay between retry attempts in milliseconds (default: 1000)

#### shouldRetry?

(`error`) => `boolean`

Predicate that decides if a failed attempt should be retried (default: retry all non-timeout errors)

#### timeoutErrorMessage?

`string`

Custom error message for timeout errors

#### timeoutMs?

`number`

Optional per-attempt timeout in milliseconds (omit if fn handles timeout internally)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Promise that resolves with the result

## Throws

If any attempt exceeds timeout

## Throws

If all retries are exhausted

## Example

```typescript
// Retry up to 3 times (4 total attempts) on 5xx errors only with timeout
const data = await withRetry(
  () => fetchFromAPI('/endpoint'),
  {
    maxRetries: 3,
    timeoutMs: 5000,
    retryDelayMs: 1000,
    shouldRetry: (error) => error.statusCode >= 500
  }
);

// Retry without additional timeout (fn handles timeout internally)
const data2 = await withRetry(
  () => withTimeoutAndAbort(signal => fetch(url, { signal }), 5000),
  {
    maxRetries: 3,
    retryDelayMs: 1000,
    shouldRetry: (error) => error.statusCode >= 500
  }
);
```

## Security

- Prevents retry storms with exponential backoff
- Respects timeout limits per attempt (when provided)
- Configurable retry conditions for security

## Since

0.8.0
