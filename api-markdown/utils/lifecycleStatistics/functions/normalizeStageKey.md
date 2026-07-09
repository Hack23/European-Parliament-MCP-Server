[**European Parliament MCP Server API v1.3.41**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/lifecycleStatistics](../README.md) / normalizeStageKey

# Function: normalizeStageKey()

> **normalizeStageKey**(`type`): `string`

Defined in: [utils/lifecycleStatistics.ts:116](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/lifecycleStatistics.ts#L116)

Normalize an EP event type to a stable stage key.

The EP API sometimes returns event types as short codes (`REFERRAL`,
`COM_VOTE`) and sometimes as URI strings (`def/ep-activities/REFERRAL`).
This helper strips any URI prefix and uppercases the result so both forms
map to the same stage in the dwell distribution.

## Parameters

### type

`string`

Raw event type from the EP API

## Returns

`string`

Normalized stage key, or empty string when unavailable
