[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/timeout](../README.md) / withTimeoutConfig

# Function: withTimeoutConfig()

> **withTimeoutConfig**\<`T`\>(`promise`, `config`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [utils/timeout.ts:357](https://github.com/Hack23/European-Parliament-MCP-Server/blob/67dbd67a8f5629591a17b9785bfa0977f7023afb/src/utils/timeout.ts#L357)

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

## Example

```typescript
const config: TimeoutConfig = { timeoutMs: 5000, operationName: 'fetchMEPs' };
const result = await withTimeoutConfig(fetchMEPs(), config);
```
