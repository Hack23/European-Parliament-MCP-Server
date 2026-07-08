[**European Parliament MCP Server API v1.3.39**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/votingBaseline](../README.md) / WeekBucket

# Interface: WeekBucket

Defined in: [utils/votingBaseline.ts:87](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L87)

Per-week aggregate built by [bucketByWeek](../functions/bucketByWeek.md).

## Properties

### abstentionRate

> **abstentionRate**: `number`

Defined in: [utils/votingBaseline.ts:114](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L114)

Abstention rate as a percentage of voted (decisive + abstain), 0 when `voted === 0`.

***

### abstentions

> **abstentions**: `number`

Defined in: [utils/votingBaseline.ts:97](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L97)

Votes where the MEP abstained.

***

### crossPartyAlignments

> **crossPartyAlignments**: `number`

Defined in: [utils/votingBaseline.ts:108](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L108)

Decisive defections where the MEP's position *also* matched at least one
non-home group's plurality majority — i.e. a true cross-party signal.

This count is intentionally narrower than "any decisive vote matching a
non-home majority": when the MEP aligns with their home group, matching
other groups voting the same way reflects consensus, not cross-party
realignment. Only counted when the MEP both broke from home AND moved
toward another bloc.

***

### decisive

> **decisive**: `number`

Defined in: [utils/votingBaseline.ts:93](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L93)

Number of decisive votes (FOR/AGAINST, excludes abstentions).

***

### defectionRate

> **defectionRate**: `number`

Defined in: [utils/votingBaseline.ts:112](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L112)

Defection rate as a percentage of decisive votes, 0 when `decisive === 0`.

***

### defections

> **defections**: `number`

Defined in: [utils/votingBaseline.ts:95](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L95)

Decisive votes where the MEP defected from the home-group majority.

***

### voted

> **voted**: `number`

Defined in: [utils/votingBaseline.ts:91](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L91)

Number of votes (decisive + abstentions, excludes absences).

***

### voteIds

> **voteIds**: `string`[]

Defined in: [utils/votingBaseline.ts:110](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L110)

DOCEO vote IDs in this bucket (preserving DOCEO order).

***

### weekStart

> **weekStart**: `string`

Defined in: [utils/votingBaseline.ts:89](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L89)

ISO week start (Monday) in YYYY-MM-DD format.
