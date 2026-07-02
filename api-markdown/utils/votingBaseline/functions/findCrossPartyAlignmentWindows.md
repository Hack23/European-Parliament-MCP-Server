[**European Parliament MCP Server API v1.3.34**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/votingBaseline](../README.md) / findCrossPartyAlignmentWindows

# Function: findCrossPartyAlignmentWindows()

> **findCrossPartyAlignmentWindows**(`buckets`, `share?`): [`CrossPartyWindow`](../interfaces/CrossPartyWindow.md)[]

Defined in: [utils/votingBaseline.ts:494](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L494)

Find sub-windows (weeks) where the MEP defected toward non-home-group
majorities on ≥ `share` of decisive RCVs.

Skips weeks with fewer than [MIN\_SUBWINDOW\_DECISIVE\_VOTES](../variables/MIN_SUBWINDOW_DECISIVE_VOTES.md) decisive
votes to avoid spurious 100% windows on tiny samples.

Units: the `share` parameter is a **fraction** (0–1). The returned
[CrossPartyWindow.sharePercent](../interfaces/CrossPartyWindow.md#sharepercent) field is converted to a
**percentage** (0–100) for consumer ergonomics — keep this distinction in
mind when wiring severity classifiers (e.g. `severityFromShare` expects
percent input).

## Parameters

### buckets

[`WeekBucket`](../interfaces/WeekBucket.md)[]

Output of [bucketByWeek](bucketByWeek.md).

### share?

`number` = `DEFAULT_CROSS_PARTY_SHARE`

Minimum share (0–1) of decisive RCVs where the MEP
  defected toward non-home group majorities (default
  [DEFAULT\_CROSS\_PARTY\_SHARE](../variables/DEFAULT_CROSS_PARTY_SHARE.md)).

## Returns

[`CrossPartyWindow`](../interfaces/CrossPartyWindow.md)[]

Windows in chronological order.
