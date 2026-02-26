[**European Parliament MCP Server API v0.8.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [services/MetricsService](../README.md) / MetricsService

# Class: MetricsService

Defined in: [services/MetricsService.ts:69](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/services/MetricsService.ts#L69)

Performance Metrics Service
Cyclomatic complexity: 8

## Constructors

### Constructor

> **new MetricsService**(`maxHistogramSamples?`): `MetricsService`

Defined in: [services/MetricsService.ts:73](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/services/MetricsService.ts#L73)

#### Parameters

##### maxHistogramSamples?

`number` = `1000`

#### Returns

`MetricsService`

## Properties

### maxHistogramSamples

> `private` `readonly` **maxHistogramSamples**: `number`

Defined in: [services/MetricsService.ts:71](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/services/MetricsService.ts#L71)

***

### metrics

> `private` `readonly` **metrics**: [`Map`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, `MetricValue`\>

Defined in: [services/MetricsService.ts:70](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/services/MetricsService.ts#L70)

## Methods

### buildKey()

> `private` **buildKey**(`name`, `labels?`): `string`

Defined in: [services/MetricsService.ts:216](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/services/MetricsService.ts#L216)

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

Defined in: [services/MetricsService.ts:208](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/services/MetricsService.ts#L208)

Clear all metrics
Cyclomatic complexity: 1

#### Returns

`void`

***

### getHistogramSummary()

> **getHistogramSummary**(`name`, `labels?`): \{ `avg`: `number`; `count`: `number`; `p50`: `number`; `p95`: `number`; `p99`: `number`; `sum`: `number`; \} \| `undefined`

Defined in: [services/MetricsService.ts:179](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/services/MetricsService.ts#L179)

Get histogram summary
Cyclomatic complexity: 3

#### Parameters

##### name

[`MetricKey`](../type-aliases/MetricKey.md)

Metric name

##### labels?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

Optional labels

#### Returns

\{ `avg`: `number`; `count`: `number`; `p50`: `number`; `p95`: `number`; `p99`: `number`; `sum`: `number`; \} \| `undefined`

Histogram summary with percentiles

***

### getMetric()

> **getMetric**(`name`, `labels?`): `number` \| `undefined`

Defined in: [services/MetricsService.ts:164](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/services/MetricsService.ts#L164)

Get current metric value
Cyclomatic complexity: 3

#### Parameters

##### name

[`MetricKey`](../type-aliases/MetricKey.md)

Metric name

##### labels?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

Optional labels

#### Returns

`number` \| `undefined`

Current metric value or undefined

***

### incrementCounter()

> **incrementCounter**(`name`, `value?`, `labels?`): `void`

Defined in: [services/MetricsService.ts:85](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/services/MetricsService.ts#L85)

Increment a counter metric
Cyclomatic complexity: 2

#### Parameters

##### name

[`MetricKey`](../type-aliases/MetricKey.md)

Metric name

##### value?

`number` = `1`

Increment value (default: 1)

##### labels?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

Optional labels for metric dimensions

#### Returns

`void`

***

### observeHistogram()

> **observeHistogram**(`name`, `value`, `labels?`): `void`

Defined in: [services/MetricsService.ts:124](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/services/MetricsService.ts#L124)

Record a histogram observation
Cyclomatic complexity: 3

#### Parameters

##### name

[`MetricKey`](../type-aliases/MetricKey.md)

Metric name

##### value

`number`

Observed value

##### labels?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

Optional labels for metric dimensions

#### Returns

`void`

***

### partition()

> `private` **partition**(`arr`, `left`, `right`, `pivotIndex`): `number`

Defined in: [services/MetricsService.ts:293](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/services/MetricsService.ts#L293)

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

Defined in: [services/MetricsService.ts:235](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/services/MetricsService.ts#L235)

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

Defined in: [services/MetricsService.ts:257](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/services/MetricsService.ts#L257)

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

Defined in: [services/MetricsService.ts:106](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/services/MetricsService.ts#L106)

Set a gauge metric value
Cyclomatic complexity: 1

#### Parameters

##### name

[`MetricKey`](../type-aliases/MetricKey.md)

Metric name

##### value

`number`

Gauge value

##### labels?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

Optional labels for metric dimensions

#### Returns

`void`
