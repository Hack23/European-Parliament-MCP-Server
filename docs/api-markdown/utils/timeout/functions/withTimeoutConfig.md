[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/timeout](../README.md) / withTimeoutConfig

# Function: withTimeoutConfig()

> **withTimeoutConfig**\<`T`\>(`promise`, `config`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [utils/timeout.ts:370](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/utils/timeout.ts#L370)

Execute a promise with timeout settings from a [TimeoutConfig](../interfaces/TimeoutConfig.md).

Convenience wrapper around [withTimeout](withTimeout.md) for callers that
already hold a `TimeoutConfig` object (e.g., from environment config).

## Type Parameters

### T

`T`

Type of the promise result

## Parameters

### promise

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Promise to execute with timeout

### config

[`TimeoutConfig`](../interfaces/TimeoutConfig.md)

Timeout configuration object

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Promise resolving with the result or rejecting with TimeoutError

## Throws

If the operation exceeds `config.timeoutMs`

## Throws

If `config.timeoutMs` is not positive

## Example

```typescript
const config: TimeoutConfig = { timeoutMs: 5000, operationName: 'fetchMEPs' };
const result = await withTimeoutConfig(fetchMEPs(), config);
```

## Since

0.8.0
