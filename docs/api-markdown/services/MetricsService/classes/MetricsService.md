[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [services/MetricsService](../README.md) / MetricsService

# Class: MetricsService

Defined in: [services/MetricsService.ts:69](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/MetricsService.ts#L69)

Performance Metrics Service
Cyclomatic complexity: 8

## Constructors

### Constructor

> **new MetricsService**(`maxHistogramSamples?`): `MetricsService`

Defined in: [services/MetricsService.ts:73](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/MetricsService.ts#L73)

#### Parameters

##### maxHistogramSamples?

`number` = `1000`

#### Returns

`MetricsService`

## Properties

### maxHistogramSamples

> `private` `readonly` **maxHistogramSamples**: `number`

Defined in: [services/MetricsService.ts:71](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/MetricsService.ts#L71)

***

### metrics

> `private` `readonly` **metrics**: [`Map`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, `MetricValue`\>

Defined in: [services/MetricsService.ts:70](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/MetricsService.ts#L70)

## Methods

### buildKey()

> `private` **buildKey**(`name`, `labels?`): `string`

Defined in: [services/MetricsService.ts:289](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/MetricsService.ts#L289)

Build metric key from name and labels
Cyclomatic complexity: 2

#### Parameters

##### name

[`MetricKey`](../type-aliases/MetricKey.md)

##### labels?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

#### Returns

`string`

***

### clear()

> **clear**(): `void`

Defined in: [services/MetricsService.ts:281](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/MetricsService.ts#L281)

Clears all recorded metrics from memory.

Intended for use in **tests** to ensure metric isolation between cases.
Calling this in production will silently discard all instrumentation data.

#### Returns

`void`

#### Example

```typescript
afterEach(() => {
  metricsService.clear();
});
```

#### Since

0.8.0

***

### getHistogramSummary()

> **getHistogramSummary**(`name`, `labels?`): \{ `avg`: `number`; `count`: `number`; `p50`: `number`; `p95`: `number`; `p99`: `number`; `sum`: `number`; \} \| `undefined`

Defined in: [services/MetricsService.ts:241](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/MetricsService.ts#L241)

Returns a statistical summary of a histogram metric.

Computes count, sum, average, and p50 / p95 / p99 percentiles from
the stored samples. Returns `undefined` if the metric does not exist,
is not a histogram, or has no samples yet.

#### Parameters

##### name

[`MetricKey`](../type-aliases/MetricKey.md)

Histogram metric name to summarise

##### labels?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

Optional label dimensions to scope the lookup

#### Returns

\{ `avg`: `number`; `count`: `number`; `p50`: `number`; `p95`: `number`; `p99`: `number`; `sum`: `number`; \} \| `undefined`

Summary object with `count`, `sum`, `avg`, `p50`, `p95`, `p99`,
  or `undefined` if no histogram data exists

#### Example

```typescript
const summary = metricsService.getHistogramSummary('ep_api_latency_ms');
if (summary) {
  console.log(`p95 latency: ${summary.p95}ms`);
}
```

#### Since

0.8.0

***

### getMetric()

> **getMetric**(`name`, `labels?`): `number` \| `undefined`

Defined in: [services/MetricsService.ts:212](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/MetricsService.ts#L212)

Returns the current scalar value of a counter or gauge metric.

Returns `undefined` for histogram metrics (use [getHistogramSummary](#gethistogramsummary)
instead) and for metrics that have not been recorded yet.

#### Parameters

##### name

[`MetricKey`](../type-aliases/MetricKey.md)

Metric name to query

##### labels?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

Optional label dimensions to scope the lookup

#### Returns

`number` \| `undefined`

Current numeric value, or `undefined` if not found / is a histogram

#### Example

```typescript
const errors = metricsService.getMetric(MetricName.EP_API_ERROR_COUNT) ?? 0;
if (errors > 10) {
  console.warn('High EP API error rate');
}
```

#### Since

0.8.0

***

### incrementCounter()

> **incrementCounter**(`name`, `value?`, `labels?`): `void`

Defined in: [services/MetricsService.ts:97](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/MetricsService.ts#L97)

Increments a counter metric by the given value.

Creates the counter at zero if it does not exist yet, then adds `value`.
Counters are monotonically increasing — use [setGauge](#setgauge) for
values that can decrease.

#### Parameters

##### name

[`MetricKey`](../type-aliases/MetricKey.md)

Metric name (use a [MetricName](../enumerations/MetricName.md) enum value for type safety)

##### value?

`number` = `1`

Amount to add to the counter (default: `1`)

##### labels?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

Optional key/value label dimensions (e.g., `{ endpoint: '/meps' }`)

#### Returns

`void`

#### Throws

If `name` is not a string

#### Example

```typescript
metricsService.incrementCounter(MetricName.EP_API_CALL_COUNT);
metricsService.incrementCounter(MetricName.EP_API_CALL_COUNT, 1, { endpoint: '/meps' });
```

#### Since

0.8.0

***

### observeHistogram()

> **observeHistogram**(`name`, `value`, `labels?`): `void`

Defined in: [services/MetricsService.ts:160](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/MetricsService.ts#L160)

Records a single observation into a histogram metric.

Uses reservoir sampling to keep sample count bounded at
`maxHistogramSamples`. Use [getHistogramSummary](#gethistogramsummary) to retrieve
computed percentiles.

#### Parameters

##### name

[`MetricKey`](../type-aliases/MetricKey.md)

Metric name (use a [MetricName](../enumerations/MetricName.md) enum value for type safety)

##### value

`number`

Observed value (e.g., response time in milliseconds)

##### labels?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

Optional key/value label dimensions

#### Returns

`void`

#### Throws

If `name` is not a string

#### Example

```typescript
const start = Date.now();
await fetchFromEPAPI('/meps');
metricsService.observeHistogram('ep_api_latency_ms', Date.now() - start);
```

#### Since

0.8.0

***

### partition()

> `private` **partition**(`arr`, `left`, `right`, `pivotIndex`): `number`

Defined in: [services/MetricsService.ts:366](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/MetricsService.ts#L366)

Partition helper for quickselect (Lomuto-style)
Cyclomatic complexity: 4

#### Parameters

##### arr

`number`[]

Array to partition

##### left

`number`

Left bound

##### right

`number`

Right bound

##### pivotIndex

`number`

Pivot index

#### Returns

`number`

New pivot index

***

### percentileFromUnsorted()

> `private` **percentileFromUnsorted**(`values`, `percentile`): `number`

Defined in: [services/MetricsService.ts:308](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/MetricsService.ts#L308)

Compute a percentile value from an unsorted array using quickselect
Cyclomatic complexity: 3

#### Parameters

##### values

`number`[]

Array of samples

##### percentile

`number`

Percentile to compute (0-100)

#### Returns

`number`

Percentile value

***

### selectKth()

> `private` **selectKth**(`arr`, `k`): `number`

Defined in: [services/MetricsService.ts:330](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/MetricsService.ts#L330)

Select the k-th smallest element using quickselect
Cyclomatic complexity: 5

#### Parameters

##### arr

`number`[]

Array to select from (will be mutated)

##### k

`number`

Index of element to select (0-based)

#### Returns

`number`

The k-th smallest element

***

### setGauge()

> **setGauge**(`name`, `value`, `labels?`): `void`

Defined in: [services/MetricsService.ts:129](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/MetricsService.ts#L129)

Sets a gauge metric to an absolute value.

Unlike counters, gauges can be set to any value including decreasing
values (e.g., current queue depth, active connection count).

#### Parameters

##### name

[`MetricKey`](../type-aliases/MetricKey.md)

Metric name (use a [MetricName](../enumerations/MetricName.md) enum value for type safety)

##### value

`number`

Absolute gauge value to record

##### labels?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

Optional key/value label dimensions

#### Returns

`void`

#### Throws

If `name` is not a string

#### Example

```typescript
metricsService.setGauge('active_connections', 5);
metricsService.setGauge('queue_depth', 12, { queue: 'ep_api' });
```

#### Since

0.8.0
