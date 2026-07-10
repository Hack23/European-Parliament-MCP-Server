[**European Parliament MCP Server API v1.3.42**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / utils/networkVotingSimilarity

# utils/networkVotingSimilarity

## Fileoverview

Pairwise MEP voting-similarity helper for network OSINT.

Fetches DOCEO RCV records once and computes Jaccard-like agreement
scores over the set of **decisive** votes (FOR / AGAINST only — abstentions
excluded) that two MEPs jointly participated in.

`similarity(A, B) = sharedAgreements(A, B) / sharedDecisiveVotes(A, B)`

Pairs with fewer than [MIN\_SHARED\_DECISIVE\_VOTES](variables/MIN_SHARED_DECISIVE_VOTES.md) co-participations
are skipped to suppress spurious edges with poor statistical support.

The helper is intentionally narrow — it does NOT cache the matrix, since
each `network_analysis` call may scope to a different MEP subset.

Behaviour mirrors `computeCoalitionCohesionFromDoceo`:
- bounded by `withTimeoutAndAbort` (default 5 s — larger than the 2 s
  cohesion guard because individual-vote XML is heavier)
- errors are silently suppressed → the caller falls back to committee edges

ISMS Policy: SC-002, AC-003, AU-002. GDPR Article 5(1)(d) — accuracy
(Open-data public-figure data, decisive RCVs only).

## Since

1.4.0

## Interfaces

- [ComputeNetworkVotingSimilarityOptions](interfaces/ComputeNetworkVotingSimilarityOptions.md)
- [NetworkVotingSimilarityResult](interfaces/NetworkVotingSimilarityResult.md)
- [VotingSimilarityEdge](interfaces/VotingSimilarityEdge.md)

## Variables

- [DEFAULT\_DOCEO\_PAGE\_SIZE](variables/DEFAULT_DOCEO_PAGE_SIZE.md)
- [MIN\_SHARED\_DECISIVE\_VOTES](variables/MIN_SHARED_DECISIVE_VOTES.md)
- [NETWORK\_VOTING\_SIMILARITY\_TIMEOUT\_MS](variables/NETWORK_VOTING_SIMILARITY_TIMEOUT_MS.md)

## Functions

- [computeNetworkVotingSimilarityFromDoceo](functions/computeNetworkVotingSimilarityFromDoceo.md)
