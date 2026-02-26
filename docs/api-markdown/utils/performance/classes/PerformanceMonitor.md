[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/performance](../README.md) / PerformanceMonitor

# Class: PerformanceMonitor

Defined in: [utils/performance.ts:88](https://github.com/Hack23/European-Parliament-MCP-Server/blob/67dbd67a8f5629591a17b9785bfa0977f7023afb/src/utils/performance.ts#L88)

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

Defined in: [utils/performance.ts:97](https://github.com/Hack23/European-Parliament-MCP-Server/blob/67dbd67a8f5629591a17b9785bfa0977f7023afb/src/utils/performance.ts#L97)

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

Defined in: [utils/performance.ts:90](https://github.com/Hack23/European-Parliament-MCP-Server/blob/67dbd67a8f5629591a17b9785bfa0977f7023afb/src/utils/performance.ts#L90)

***

### metrics

> `private` `readonly` **metrics**: [`Map`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, `number`[]\>

Defined in: [utils/performance.ts:89](https://github.com/Hack23/European-Parliament-MCP-Server/blob/67dbd67a8f5629591a17b9785bfa0977f7023afb/src/utils/performance.ts#L89)

## Methods

### clear()

> **clear**(): `void`

Defined in: [utils/performance.ts:251](https://github.com/Hack23/European-Parliament-MCP-Server/blob/67dbd67a8f5629591a17b9785bfa0977f7023afb/src/utils/performance.ts#L251)

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

Defined in: [utils/performance.ts:265](https://github.com/Hack23/European-Parliament-MCP-Server/blob/67dbd67a8f5629591a17b9785bfa0977f7023afb/src/utils/performance.ts#L265)

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

Defined in: [utils/performance.ts:234](https://github.com/Hack23/European-Parliament-MCP-Server/blob/67dbd67a8f5629591a17b9785bfa0977f7023afb/src/utils/performance.ts#L234)

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

Defined in: [utils/performance.ts:153](https://github.com/Hack23/European-Parliament-MCP-Server/blob/67dbd67a8f5629591a17b9785bfa0977f7023afb/src/utils/performance.ts#L153)

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

Defined in: [utils/performance.ts:117](https://github.com/Hack23/European-Parliament-MCP-Server/blob/67dbd67a8f5629591a17b9785bfa0977f7023afb/src/utils/performance.ts#L117)

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
