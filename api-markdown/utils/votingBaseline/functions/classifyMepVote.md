[**European Parliament MCP Server API v1.3.23**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/votingBaseline](../README.md) / classifyMepVote

# Function: classifyMepVote()

> **classifyMepVote**(`vote`, `mepId`, `homeGroup`): [`ClassifiedVote`](../interfaces/ClassifiedVote.md)

Defined in: [utils/votingBaseline.ts:266](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L266)

Classify an MEP's vote against their home group's majority on a single RCV.

## Parameters

### vote

[`LatestVoteRecord`](../../../clients/ep/doceoXmlParser/interfaces/LatestVoteRecord.md)

DOCEO [LatestVoteRecord](../../../clients/ep/doceoXmlParser/interfaces/LatestVoteRecord.md).

### mepId

`string`

EP MEP identifier (e.g. `"197558"`).

### homeGroup

`string` \| `null`

The MEP's canonical home group (e.g. `"EPP"`); when
  `null` (group unresolved) the alignment is reported but no defection
  classification is attempted.

## Returns

[`ClassifiedVote`](../interfaces/ClassifiedVote.md)

Per-vote classification.
