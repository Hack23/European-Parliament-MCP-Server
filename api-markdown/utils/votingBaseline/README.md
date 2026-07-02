[**European Parliament MCP Server API v1.3.33**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / utils/votingBaseline

# utils/votingBaseline

## Fileoverview

Per-MEP voting baseline computation for anomaly detection.

Provides primitives for the `detect_voting_anomalies` MCP tool:

- [resolveGroupMajority](functions/resolveGroupMajority.md) — DOCEO group-breakdown → plurality position
  (FOR/AGAINST/ABSTAIN) with deterministic alphabetical tie-breaking.
- [classifyMepVote](functions/classifyMepVote.md) — for a given MEP and a single
  [LatestVoteRecord](../../clients/ep/doceoXmlParser/interfaces/LatestVoteRecord.md), returns whether the MEP was `aligned` with their
  home group's majority, `defected`, `abstained`, or was `absent`, plus the
  list of *other* groups whose majority matched the MEP's position (used to
  detect cross-party alignment shifts).
- [bucketByWeek](functions/bucketByWeek.md) — groups classified votes into ISO-week buckets and
  computes per-week defection / abstention rates.
- [computeBaseline](functions/computeBaseline.md) / [zScore](functions/zScore.md) — running mean & standard
  deviation of weekly rates and per-week z-score.
- [findOutlierWeeks](functions/findOutlierWeeks.md) — collects weeks whose rate has a z-score
  ≥ a configurable threshold (default 1.5 per issue spec).
- [findWoWShifts](functions/findWoWShifts.md) — collects consecutive-week pairs whose defection
  rate jumped by ≥ a configurable threshold (default 20 percentage points).
- [findCrossPartyAlignmentWindows](functions/findCrossPartyAlignmentWindows.md) — sub-windows where the MEP voted
  with *non-home* group majorities on ≥ a configurable share (default 60%)
  of decisive RCVs.

All helpers are pure and deterministic so they can be exercised with
synthetic fixtures and the golden-snapshot suite referenced in the
`detect_voting_anomalies` issue.

ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege),
  AU-002 (Audit Logging). GDPR Article 5(1)(d) — accuracy.

## Since

1.4.0

## Interfaces

- [BaselineSummary](interfaces/BaselineSummary.md)
- [ClassifiedVote](interfaces/ClassifiedVote.md)
- [CrossPartyWindow](interfaces/CrossPartyWindow.md)
- [OutlierWeek](interfaces/OutlierWeek.md)
- [WeekBucket](interfaces/WeekBucket.md)
- [WoWShift](interfaces/WoWShift.md)

## Type Aliases

- [Alignment](type-aliases/Alignment.md)
- [VotePosition](type-aliases/VotePosition.md)

## Variables

- [DEFAULT\_CROSS\_PARTY\_SHARE](variables/DEFAULT_CROSS_PARTY_SHARE.md)
- [DEFAULT\_WOW\_THRESHOLD\_PP](variables/DEFAULT_WOW_THRESHOLD_PP.md)
- [DEFAULT\_Z\_SCORE\_THRESHOLD](variables/DEFAULT_Z_SCORE_THRESHOLD.md)
- [MAX\_PLENARY\_WEEKS](variables/MAX_PLENARY_WEEKS.md)
- [MIN\_SUBWINDOW\_DECISIVE\_VOTES](variables/MIN_SUBWINDOW_DECISIVE_VOTES.md)

## Functions

- [bucketByWeek](functions/bucketByWeek.md)
- [classifyMepVote](functions/classifyMepVote.md)
- [computeBaseline](functions/computeBaseline.md)
- [coverageConfidence](functions/coverageConfidence.md)
- [findCrossPartyAlignmentWindows](functions/findCrossPartyAlignmentWindows.md)
- [findOutlierWeeks](functions/findOutlierWeeks.md)
- [findWoWShifts](functions/findWoWShifts.md)
- [isoWeekStart](functions/isoWeekStart.md)
- [iteratePlenaryWeeks](functions/iteratePlenaryWeeks.md)
- [resolveGroupBreakdownRow](functions/resolveGroupBreakdownRow.md)
- [resolveGroupMajority](functions/resolveGroupMajority.md)
- [zScore](functions/zScore.md)
