[**European Parliament MCP Server API v1.3.27**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/networkVotingSimilarity](../README.md) / VotingSimilarityEdge

# Interface: VotingSimilarityEdge

Defined in: [utils/networkVotingSimilarity.ts:46](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/networkVotingSimilarity.ts#L46)

Result of a single similarity computation between MEPs.

## Properties

### sharedDecisiveVotes

> **sharedDecisiveVotes**: `number`

Defined in: [utils/networkVotingSimilarity.ts:54](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/networkVotingSimilarity.ts#L54)

Number of decisive votes both MEPs participated in.

***

### similarity

> **similarity**: `number`

Defined in: [utils/networkVotingSimilarity.ts:52](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/networkVotingSimilarity.ts#L52)

Agreement share in `[0, 1]`.

***

### sourceId

> **sourceId**: `string`

Defined in: [utils/networkVotingSimilarity.ts:48](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/networkVotingSimilarity.ts#L48)

Stable lexicographic-first MEP id.

***

### targetId

> **targetId**: `string`

Defined in: [utils/networkVotingSimilarity.ts:50](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/networkVotingSimilarity.ts#L50)

Stable lexicographic-second MEP id.
