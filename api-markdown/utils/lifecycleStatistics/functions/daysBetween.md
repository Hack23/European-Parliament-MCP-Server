[**European Parliament MCP Server API v1.3.27**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/lifecycleStatistics](../README.md) / daysBetween

# Function: daysBetween()

> **daysBetween**(`fromIso`, `toIso`): `number`

Defined in: [utils/lifecycleStatistics.ts:179](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/lifecycleStatistics.ts#L179)

Compute integer days between two ISO date strings, clamped to ≥0.

## Parameters

### fromIso

`string`

Earlier ISO date string

### toIso

`string`

Later ISO date string

## Returns

`number`

Whole-day delta, or 0 when either date is invalid
