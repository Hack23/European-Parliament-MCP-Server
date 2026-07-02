[**European Parliament MCP Server API v1.3.34**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/votingBaseline](../README.md) / bucketByWeek

# Function: bucketByWeek()

> **bucketByWeek**(`votes`): [`WeekBucket`](../interfaces/WeekBucket.md)[]

Defined in: [utils/votingBaseline.ts:328](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L328)

Bucket classified votes into ISO-week buckets keyed by Monday's date.

Buckets are returned in chronological order (oldest first). Votes without
a valid sittingDate are bucketed under the empty-string key and *placed at
the tail* (sorting empty-string ahead of real dates would otherwise
distort week-over-week shift detection and baseline computations).

## Parameters

### votes

[`ClassifiedVote`](../interfaces/ClassifiedVote.md)[]

Sequence of classified MEP votes.

## Returns

[`WeekBucket`](../interfaces/WeekBucket.md)[]

Per-week aggregates with computed defection / abstention rates.
