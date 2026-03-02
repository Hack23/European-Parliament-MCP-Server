[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/performance](../README.md) / PerformanceMonitor

# Class: PerformanceMonitor

Defined in: [utils/performance.ts:88](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/performance.ts#L88)

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

Defined in: [utils/performance.ts:107](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/performance.ts#L107)

Creates a new performance monitor.

#### Parameters

##### maxSamples?

`number` = `1000`

Maximum number of duration samples to retain per
  operation name. Older samples are evicted when the limit is reached
  (sliding window). Default: `1000`.

#### Returns

`PerformanceMonitor`

#### Throws

If `maxSamples` is not a positive finite integer

#### Example

```typescript
const monitor = new PerformanceMonitor(500);
```

#### Since

0.8.0

## Properties

### maxSamples

> `private` `readonly` **maxSamples**: `number`

Defined in: [utils/performance.ts:90](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/performance.ts#L90)

***

### metrics

> `private` `readonly` **metrics**: [`Map`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, `number`[]\>

Defined in: [utils/performance.ts:89](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/performance.ts#L89)

## Methods

### clear()

> **clear**(): `void`

Defined in: [utils/performance.ts:277](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/performance.ts#L277)

Clears all recorded duration samples for every tracked operation.

Useful for resetting state between test cases or at the start of a new
monitoring window.

#### Returns

`void`

#### Example

```typescript
// Reset metrics after each test
afterEach(() => {
  monitor.clear();
});
```

#### Since

0.8.0

***

### clearOperation()

> **clearOperation**(`operation`): `void`

Defined in: [utils/performance.ts:293](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/performance.ts#L293)

Clears recorded duration samples for a single operation.

#### Parameters

##### operation

`string`

Operation name whose samples should be discarded

#### Returns

`void`

#### Example

```typescript
monitor.clearOperation('api_call');
```

#### Since

0.8.0

***

### getOperations()

> **getOperations**(): `string`[]

Defined in: [utils/performance.ts:257](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/performance.ts#L257)

Returns all operation names currently being tracked.

#### Returns

`string`[]

Array of operation name strings, in insertion order

#### Example

```typescript
const operations = monitor.getOperations();
operations.forEach(op => {
  const stats = monitor.getStats(op);
  console.log(`${op}: p95=${stats?.p95}ms`);
});
```

#### Since

0.8.0

***

### getStats()

> **getStats**(`operation`): [`PerformanceStats`](../interfaces/PerformanceStats.md) \| `null`

Defined in: [utils/performance.ts:174](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/performance.ts#L174)

Returns aggregated performance statistics for a named operation.

Calculates percentiles (p50 / p95 / p99), average, min, and max from
the stored duration samples. Returns `null` when no samples have been
recorded for the operation yet.

#### Parameters

##### operation

`string`

Operation name / identifier to query

#### Returns

[`PerformanceStats`](../interfaces/PerformanceStats.md) \| `null`

[PerformanceStats](../interfaces/PerformanceStats.md) object, or `null` if no data exists

#### Throws

If `operation` is not a string

#### Example

```typescript
const stats = monitor.getStats('api_call');
if (stats && stats.p95 > 1000) {
  console.warn('API calls are slow (p95 > 1s)');
}
```

#### Since

0.8.0

***

### recordDuration()

> **recordDuration**(`operation`, `durationMs`): `void`

Defined in: [utils/performance.ts:134](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/performance.ts#L134)

Records a duration sample for the named operation.

When the number of stored samples reaches `maxSamples`, the oldest
entries are evicted in bulk (sliding window). Use [getStats](#getstats) to
retrieve aggregated statistics after recording samples.

#### Parameters

##### operation

`string`

Unique operation name / identifier (e.g., `'ep_api_call'`)

##### durationMs

`number`

Observed duration in milliseconds (should be ≥ 0)

#### Returns

`void`

#### Throws

If `operation` is not a string

#### Example

```typescript
const start = performance.now();
await doWork();
monitor.recordDuration('work', performance.now() - start);
```

#### Since

0.8.0
