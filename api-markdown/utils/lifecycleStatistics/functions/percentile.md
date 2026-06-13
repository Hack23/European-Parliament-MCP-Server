[**European Parliament MCP Server API v1.3.21**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/lifecycleStatistics](../README.md) / percentile

# Function: percentile()

> **percentile**(`values`, `percentile`): `number`

Defined in: [utils/lifecycleStatistics.ts:164](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/lifecycleStatistics.ts#L164)

Compute a percentile using nearest-rank with `Math.ceil`.

Deterministic and tie-stable: identical fixture sets produce identical
percentiles regardless of insertion order. Inputs are always sorted before
the percentile rank is read so the return value is consistent for all
inputs in the documented range.

## Parameters

### values

readonly `number`[]

Numeric samples

### percentile

`number`

Percentile in the range [0, 100]. Values ≤ 0 return
  the minimum (sorted[0]); values ≥ 100 return the maximum.

## Returns

`number`

The percentile value, or 0 for empty inputs
