[**European Parliament MCP Server API v1.3.28**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/networkVotingSimilarity](../README.md) / ComputeNetworkVotingSimilarityOptions

# Interface: ComputeNetworkVotingSimilarityOptions

Defined in: [utils/networkVotingSimilarity.ts:70](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/networkVotingSimilarity.ts#L70)

Options accepted by [computeNetworkVotingSimilarityFromDoceo](../functions/computeNetworkVotingSimilarityFromDoceo.md).

## Properties

### limit?

> `optional` **limit?**: `number`

Defined in: [utils/networkVotingSimilarity.ts:74](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/networkVotingSimilarity.ts#L74)

Max DOCEO records to fetch (default 100).

***

### minSimilarity?

> `optional` **minSimilarity?**: `number`

Defined in: [utils/networkVotingSimilarity.ts:72](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/networkVotingSimilarity.ts#L72)

Minimum similarity score (default 0.7).

***

### timeoutMs?

> `optional` **timeoutMs?**: `number`

Defined in: [utils/networkVotingSimilarity.ts:76](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/networkVotingSimilarity.ts#L76)

Override the default 5 s DOCEO timeout (ms).

***

### weekStart?

> `optional` **weekStart?**: `string`

Defined in: [utils/networkVotingSimilarity.ts:78](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/networkVotingSimilarity.ts#L78)

Plenary-week anchor passed through to `doceoClient.getLatestVotes`.
