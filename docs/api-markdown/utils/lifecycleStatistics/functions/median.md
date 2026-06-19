[**European Parliament MCP Server API v1.3.25**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/lifecycleStatistics](../README.md) / median

# Function: median()

> **median**(`values`): `number`

Defined in: [utils/lifecycleStatistics.ts:144](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/lifecycleStatistics.ts#L144)

Compute the lower-median of a numeric array.

Deterministic: input is sorted ascending with the stable JS sort.
For even-length arrays the lower of the two middle elements is returned —
this avoids floating-point ties that depend on iteration order.

## Parameters

### values

readonly `number`[]

Numeric samples (will be copied, not mutated)

## Returns

`number`

Lower median, or 0 for empty inputs
