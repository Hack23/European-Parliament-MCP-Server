[**European Parliament MCP Server API v1.1.0**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / [types](../README.md) / MetricResult

# Interface: MetricResult\<T\>

Defined in: [types/index.ts:103](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/index.ts#L103)

Wrapper for a single analysis metric that explicitly communicates
data availability alongside the computed value.

When `availability` is `'UNAVAILABLE'`, `value` is always `null` and
`confidence` should typically be `'LOW'` or `'NONE'` to signal that no
meaningful confidence can be assigned. The exact value depends on whether
the containing tool's OSINT output schema supports `'NONE'`.

## Type Parameters

### T

`T` = `number`

The type of the metric value (defaults to `number`).

## Properties

### availability

> **availability**: [`DataAvailability`](../type-aliases/DataAvailability.md)

Defined in: [types/index.ts:107](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/index.ts#L107)

Availability status of the underlying EP API data.

***

### confidence

> **confidence**: `"HIGH"` \| `"MEDIUM"` \| `"LOW"` \| `"NONE"`

Defined in: [types/index.ts:109](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/index.ts#L109)

Confidence in the computed value given the available data.

***

### value

> **value**: `T` \| `null`

Defined in: [types/index.ts:105](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/index.ts#L105)

Computed metric value, or `null` when unavailable.

***

### reason?

> `optional` **reason**: `string`

Defined in: [types/index.ts:113](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/index.ts#L113)

Explanation of why the data is unavailable or estimated (optional).

***

### source?

> `optional` **source**: `string`

Defined in: [types/index.ts:111](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/index.ts#L111)

Human-readable data source description (optional).
