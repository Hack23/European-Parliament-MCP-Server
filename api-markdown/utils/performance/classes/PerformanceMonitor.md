[**European Parliament MCP Server API v0.7.3**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/performance](../README.md) / PerformanceMonitor

# Class: PerformanceMonitor

Defined in: [utils/performance.ts:63](https://github.com/Hack23/European-Parliament-MCP-Server/blob/c844f163befb571516b5718c5d197eff1e589dea/src/utils/performance.ts#L63)

Performance monitor for tracking operation metrics

Tracks duration of operations and provides statistical analysis.
Useful for identifying performance regressions and bottlenecks.

## Example

```typescript
const monitor = new PerformanceMonitor();

// Record operation durations
monitor.recordDuration('api_call', 150);
monitor.recordDuration('api_call', 200);

// Get statistics
const stats = monitor.getStats('api_call');
console.log(`p95: ${stats.p95}ms`);
```

## Constructors

### Constructor

> **new PerformanceMonitor**(`maxSamples?`): `PerformanceMonitor`

Defined in: [utils/performance.ts:72](https://github.com/Hack23/European-Parliament-MCP-Server/blob/c844f163befb571516b5718c5d197eff1e589dea/src/utils/performance.ts#L72)

Create a new performance monitor

#### Parameters

##### maxSamples?

`number` = `1000`

Maximum number of samples to retain per operation (default: 1000)

#### Returns

`PerformanceMonitor`

## Properties

### maxSamples

> `private` `readonly` **maxSamples**: `number`

Defined in: [utils/performance.ts:65](https://github.com/Hack23/European-Parliament-MCP-Server/blob/c844f163befb571516b5718c5d197eff1e589dea/src/utils/performance.ts#L65)

***

### metrics

> `private` `readonly` **metrics**: [`Map`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, `number`[]\>

Defined in: [utils/performance.ts:64](https://github.com/Hack23/European-Parliament-MCP-Server/blob/c844f163befb571516b5718c5d197eff1e589dea/src/utils/performance.ts#L64)

## Methods

### clear()

> **clear**(): `void`

Defined in: [utils/performance.ts:226](https://github.com/Hack23/European-Parliament-MCP-Server/blob/c844f163befb571516b5718c5d197eff1e589dea/src/utils/performance.ts#L226)

Clear all recorded metrics

Useful for testing or when starting a new monitoring period.

#### Returns

`void`

#### Example

```typescript
// Reset metrics after each test
afterEach(() => {
  monitor.clear();
});
```

***

### clearOperation()

> **clearOperation**(`operation`): `void`

Defined in: [utils/performance.ts:240](https://github.com/Hack23/European-Parliament-MCP-Server/blob/c844f163befb571516b5718c5d197eff1e589dea/src/utils/performance.ts#L240)

Clear metrics for a specific operation

#### Parameters

##### operation

`string`

Operation name to clear

#### Returns

`void`

#### Example

```typescript
monitor.clearOperation('api_call');
```

***

### getOperations()

> **getOperations**(): `string`[]

Defined in: [utils/performance.ts:209](https://github.com/Hack23/European-Parliament-MCP-Server/blob/c844f163befb571516b5718c5d197eff1e589dea/src/utils/performance.ts#L209)

Get all operation names being tracked

#### Returns

`string`[]

Array of operation names

#### Example

```typescript
const operations = monitor.getOperations();
operations.forEach(op => {
  const stats = monitor.getStats(op);
  console.log(`${op}: ${stats?.p95}ms`);
});
```

***

### getStats()

> **getStats**(`operation`): [`PerformanceStats`](../interfaces/PerformanceStats.md) \| `null`

Defined in: [utils/performance.ts:128](https://github.com/Hack23/European-Parliament-MCP-Server/blob/c844f163befb571516b5718c5d197eff1e589dea/src/utils/performance.ts#L128)

Get performance statistics for an operation

Calculates percentiles and averages from recorded durations.
Returns null if no measurements exist for the operation.

#### Parameters

##### operation

`string`

Operation name/identifier

#### Returns

[`PerformanceStats`](../interfaces/PerformanceStats.md) \| `null`

Performance statistics or null if no data

#### Example

```typescript
const stats = monitor.getStats('api_call');
if (stats && stats.p95 > 1000) {
  console.warn('API calls are slow (p95 > 1s)');
}
```

***

### recordDuration()

> **recordDuration**(`operation`, `durationMs`): `void`

Defined in: [utils/performance.ts:92](https://github.com/Hack23/European-Parliament-MCP-Server/blob/c844f163befb571516b5718c5d197eff1e589dea/src/utils/performance.ts#L92)

Record an operation duration

#### Parameters

##### operation

`string`

Operation name/identifier

##### durationMs

`number`

Duration in milliseconds

#### Returns

`void`

#### Example

```typescript
const start = performance.now();
await doWork();
monitor.recordDuration('work', performance.now() - start);
```
