[**European Parliament MCP Server API v1.4.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/networkVotingSimilarity](../README.md) / NetworkVotingSimilarityResult

# Interface: NetworkVotingSimilarityResult

Defined in: [utils/networkVotingSimilarity.ts:60](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/networkVotingSimilarity.ts#L60)

Result envelope for [computeNetworkVotingSimilarityFromDoceo](../functions/computeNetworkVotingSimilarityFromDoceo.md).

## Properties

### dataSource

> **dataSource**: `"DOCEO"`

Defined in: [utils/networkVotingSimilarity.ts:66](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/networkVotingSimilarity.ts#L66)

Whether the result was served from DOCEO (always `'DOCEO'` on success).

***

### edges

> **edges**: [`VotingSimilarityEdge`](VotingSimilarityEdge.md)[]

Defined in: [utils/networkVotingSimilarity.ts:62](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/networkVotingSimilarity.ts#L62)

Pairs with similarity ≥ `minSimilarity` and ≥ [MIN\_SHARED\_DECISIVE\_VOTES](../variables/MIN_SHARED_DECISIVE_VOTES.md) co-participations.

***

### rcvVotesInspected

> **rcvVotesInspected**: `number`

Defined in: [utils/networkVotingSimilarity.ts:64](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/networkVotingSimilarity.ts#L64)

Number of DOCEO RCV records inspected.
