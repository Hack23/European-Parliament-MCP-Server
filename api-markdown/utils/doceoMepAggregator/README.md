[**European Parliament MCP Server API v1.3.29**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / utils/doceoMepAggregator

# utils/doceoMepAggregator

## Fileoverview

DOCEO per-MEP voting aggregator.

Aggregates per-MEP roll-call voting statistics from the EP DOCEO XML
source. Designed to be shared by OSINT tools (`assess_mep_influence`,
`detect_voting_anomalies`, `comparative_intelligence`) that need real
RCV-derived voting activity instead of the placeholder zeros returned
by `MEPDetails.votingStatistics` when the EP API has no per-MEP data.

Behaviour mirrors `computeCoalitionCohesionFromDoceo` in
`src/tools/analyzeCoalitionDynamics.ts`:
- bounded by `withTimeoutAndAbort` (default 2 s)
- results cached for 5 minutes per `${mepId}|${dateFrom}|${dateTo}|${politicalGroup}|${limit}`
- empty/failed results are also cached briefly to avoid storms

Source: `doceoClient.getLatestVotes()` (EP DOCEO XML).

ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege),
  AU-002 (Audit Logging). GDPR Article 5(1)(d) — accuracy principle.

## Since

1.4.0

## Interfaces

- [ComputeMepVotingActivityOptions](interfaces/ComputeMepVotingActivityOptions.md)
- [DoceoMepAggregateResult](interfaces/DoceoMepAggregateResult.md)
- [MepVotingAggregateStats](interfaces/MepVotingAggregateStats.md)

## Variables

- [DOCEO\_MEP\_AGGREGATOR\_CACHE\_TTL\_MS](variables/DOCEO_MEP_AGGREGATOR_CACHE_TTL_MS.md)
- [DOCEO\_MEP\_AGGREGATOR\_TIMEOUT\_MS](variables/DOCEO_MEP_AGGREGATOR_TIMEOUT_MS.md)

## Functions

- [clearDoceoMepAggregatorCache](functions/clearDoceoMepAggregatorCache.md)
- [computeMepVotingActivityFromDoceo](functions/computeMepVotingActivityFromDoceo.md)
