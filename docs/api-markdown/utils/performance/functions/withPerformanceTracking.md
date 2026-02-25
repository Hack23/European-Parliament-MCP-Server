[**European Parliament MCP Server API v0.8.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/performance](../README.md) / withPerformanceTracking

# Function: withPerformanceTracking()

> **withPerformanceTracking**\<`T`\>(`monitor`, `operation`, `fn`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [utils/performance.ts:295](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/utils/performance.ts#L295)

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

Performance monitor to record duration

### operation

`string`

Operation name for tracking

### fn

() => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Async function to execute

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Promise that resolves with the function result

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
