[**European Parliament MCP Server API v0.9.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/performance](../README.md) / withPerformanceTracking

# Function: withPerformanceTracking()

> **withPerformanceTracking**\<`T`\>(`monitor`, `operation`, `fn`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [utils/performance.ts:326](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/performance.ts#L326)

Execute an async function and track its performance

Automatically records the duration of the operation in the
provided performance monitor.

## Type Parameters

### T

`T`

Return type of the function

## Parameters

### monitor

[`PerformanceMonitor`](../classes/PerformanceMonitor.md)

Performance monitor to record the duration in

### operation

`string`

Operation name for tracking (e.g., `'fetch_meps'`)

### fn

() => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Async function to execute and measure

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Promise that resolves with the function result

## Throws

Re-throws any error thrown by `fn` after recording the duration

## Example

```typescript
const monitor = new PerformanceMonitor();

const result = await withPerformanceTracking(
  monitor,
  'fetch_meps',
  async () => {
    return await client.getMEPs({ limit: 100 });
  }
);
```

## Since

0.8.0
