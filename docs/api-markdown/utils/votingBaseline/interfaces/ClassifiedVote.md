[**European Parliament MCP Server API v1.3.16**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/votingBaseline](../README.md) / ClassifiedVote

# Interface: ClassifiedVote

Defined in: [utils/votingBaseline.ts:60](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L60)

Single MEP/RCV-vote classification.

## Properties

### alignment

> **alignment**: [`Alignment`](../type-aliases/Alignment.md)

Defined in: [utils/votingBaseline.ts:70](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L70)

Alignment of the MEP's position with their home-group majority.

***

### groupMajority

> **groupMajority**: [`VotePosition`](../type-aliases/VotePosition.md) \| `null`

Defined in: [utils/votingBaseline.ts:72](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L72)

Plurality position of the MEP's home group on this RCV. `null` when undeterminable.

***

### matchingOtherGroups

> **matchingOtherGroups**: `string`[]

Defined in: [utils/votingBaseline.ts:81](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L81)

Canonical short codes of *other* groups whose majority matched the MEP's
position on this RCV (excludes the MEP's home group). Empty when the MEP
was absent or abstained, or when no other group had a determinable
majority matching their position.

***

### mepPosition

> **mepPosition**: [`VotePosition`](../type-aliases/VotePosition.md) \| `null`

Defined in: [utils/votingBaseline.ts:74](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L74)

Position cast by the MEP (`null` when absent).

***

### sittingDate

> **sittingDate**: `string`

Defined in: [utils/votingBaseline.ts:68](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L68)

Sitting date in YYYY-MM-DD (falls back to `vote.date` when sittingDate is absent).

***

### voteId

> **voteId**: `string`

Defined in: [utils/votingBaseline.ts:66](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L66)

DOCEO unique vote identifier (`LatestVoteRecord.id` —
e.g. `"RCV-10-2026-01-15-001"`). Used to populate
VotingAnomaly.evidenceVoteIds.
