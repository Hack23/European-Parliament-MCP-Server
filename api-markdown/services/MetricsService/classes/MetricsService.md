[**European Parliament MCP Server API v0.7.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [services/MetricsService](../README.md) / MetricsService

# Class: MetricsService

Defined in: [services/MetricsService.ts:37](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/services/MetricsService.ts#L37)

Performance Metrics Service
Cyclomatic complexity: 8

## Constructors

### Constructor

> **new MetricsService**(`maxHistogramSamples?`): `MetricsService`

Defined in: [services/MetricsService.ts:41](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/services/MetricsService.ts#L41)

#### Parameters

##### maxHistogramSamples?

`number` = `1000`

#### Returns

`MetricsService`

## Properties

### maxHistogramSamples

> `private` `readonly` **maxHistogramSamples**: `number`

Defined in: [services/MetricsService.ts:39](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/services/MetricsService.ts#L39)

***

### metrics

> `private` `readonly` **metrics**: [`Map`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, `MetricValue`\>

Defined in: [services/MetricsService.ts:38](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/services/MetricsService.ts#L38)

## Methods

### buildKey()

> `private` **buildKey**(`name`, `labels?`): `string`

Defined in: [services/MetricsService.ts:184](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/services/MetricsService.ts#L184)

Build metric key from name and labels
Cyclomatic complexity: 2

#### Parameters

##### name

`string`

##### labels?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

#### Returns

`string`

***

### clear()

> **clear**(): `void`

Defined in: [services/MetricsService.ts:176](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/services/MetricsService.ts#L176)

Clear all metrics
Cyclomatic complexity: 1

#### Returns

`void`

***

### getHistogramSummary()

> **getHistogramSummary**(`name`, `labels?`): \{ `avg`: `number`; `count`: `number`; `p50`: `number`; `p95`: `number`; `p99`: `number`; `sum`: `number`; \} \| `undefined`

Defined in: [services/MetricsService.ts:147](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/services/MetricsService.ts#L147)

Get histogram summary
Cyclomatic complexity: 3

#### Parameters

##### name

`string`

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

Defined in: [services/MetricsService.ts:132](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/services/MetricsService.ts#L132)

Get current metric value
Cyclomatic complexity: 3

#### Parameters

##### name

`string`

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

Defined in: [services/MetricsService.ts:53](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/services/MetricsService.ts#L53)

Increment a counter metric
Cyclomatic complexity: 2

#### Parameters

##### name

`string`

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

Defined in: [services/MetricsService.ts:92](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/services/MetricsService.ts#L92)

Record a histogram observation
Cyclomatic complexity: 3

#### Parameters

##### name

`string`

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

Defined in: [services/MetricsService.ts:261](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/services/MetricsService.ts#L261)

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

Defined in: [services/MetricsService.ts:203](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/services/MetricsService.ts#L203)

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

Defined in: [services/MetricsService.ts:225](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/services/MetricsService.ts#L225)

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

Defined in: [services/MetricsService.ts:74](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/services/MetricsService.ts#L74)

Set a gauge metric value
Cyclomatic complexity: 1

#### Parameters

##### name

`string`

Metric name

##### value

`number`

Gauge value

##### labels?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

Optional labels for metric dimensions

#### Returns

`void`
