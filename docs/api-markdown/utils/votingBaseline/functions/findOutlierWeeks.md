[**European Parliament MCP Server API v1.3.19**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/votingBaseline](../README.md) / findOutlierWeeks

# Function: findOutlierWeeks()

> **findOutlierWeeks**(`buckets`, `rateKey`, `threshold?`): [`OutlierWeek`](../interfaces/OutlierWeek.md)[]

Defined in: [utils/votingBaseline.ts:417](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L417)

Find weeks whose `rateKey` value has a z-score ≥ `threshold` against the
baseline computed across *all* buckets (the MEP's own rolling baseline
within the period).

## Parameters

### buckets

[`WeekBucket`](../interfaces/WeekBucket.md)[]

Output of [bucketByWeek](bucketByWeek.md).

### rateKey

`"defectionRate"` \| `"abstentionRate"`

Which rate to evaluate (`'defectionRate'` or `'abstentionRate'`).

### threshold?

`number` = `DEFAULT_Z_SCORE_THRESHOLD`

Minimum z-score that triggers an anomaly (default [DEFAULT\_Z\_SCORE\_THRESHOLD](../variables/DEFAULT_Z_SCORE_THRESHOLD.md)).

## Returns

[`OutlierWeek`](../interfaces/OutlierWeek.md)[]

Outlier weeks (chronological order).
