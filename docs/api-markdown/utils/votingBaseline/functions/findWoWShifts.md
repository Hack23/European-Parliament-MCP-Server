[**European Parliament MCP Server API v1.3.35**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/votingBaseline](../README.md) / findWoWShifts

# Function: findWoWShifts()

> **findWoWShifts**(`buckets`, `threshold?`): [`WoWShift`](../interfaces/WoWShift.md)[]

Defined in: [utils/votingBaseline.ts:452](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L452)

Find consecutive-week pairs where the defection rate jumped by `≥ threshold`
percentage points.

Only positive jumps are reported (the MEP becoming *more* defection-prone).

## Parameters

### buckets

[`WeekBucket`](../interfaces/WeekBucket.md)[]

Output of [bucketByWeek](bucketByWeek.md).

### threshold?

`number` = `DEFAULT_WOW_THRESHOLD_PP`

Minimum percentage-point delta (default [DEFAULT\_WOW\_THRESHOLD\_PP](../variables/DEFAULT_WOW_THRESHOLD_PP.md)).

## Returns

[`WoWShift`](../interfaces/WoWShift.md)[]

Detected shifts in chronological order.
