[**European Parliament MCP Server API v1.3.32**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/networkVotingSimilarity](../README.md) / computeNetworkVotingSimilarityFromDoceo

# Function: computeNetworkVotingSimilarityFromDoceo()

> **computeNetworkVotingSimilarityFromDoceo**(`mepIdSubset`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`NetworkVotingSimilarityResult`](../interfaces/NetworkVotingSimilarityResult.md) \| `null`\>

Defined in: [utils/networkVotingSimilarity.ts:198](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/networkVotingSimilarity.ts#L198)

Compute pairwise voting-similarity edges for the supplied MEP id set.

Only MEP ids in `mepIdSubset` are considered, keeping the O(V²) inner loop
bounded by the caller's network size (≤ 900 MEPs).

## Parameters

### mepIdSubset

`ReadonlySet`\<`string`\>

Set of MEP ids to score (typically the network nodes).

### options?

[`ComputeNetworkVotingSimilarityOptions`](../interfaces/ComputeNetworkVotingSimilarityOptions.md) = `{}`

Optional bounds and timeout overrides.

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`NetworkVotingSimilarityResult`](../interfaces/NetworkVotingSimilarityResult.md) \| `null`\>

Edges with similarity ≥ `minSimilarity` (default 0.7) and
  ≥ [MIN\_SHARED\_DECISIVE\_VOTES](../variables/MIN_SHARED_DECISIVE_VOTES.md) co-participations, or `null` when
  DOCEO is unavailable.

## Security

Errors are audit-logged as `network_voting_similarity.fetch` —
  only the inspected count and node count are logged; no PII.
