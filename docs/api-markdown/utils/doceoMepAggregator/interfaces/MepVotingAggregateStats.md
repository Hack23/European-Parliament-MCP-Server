[**European Parliament MCP Server API v1.3.19**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/doceoMepAggregator](../README.md) / MepVotingAggregateStats

# Interface: MepVotingAggregateStats

Defined in: [utils/doceoMepAggregator.ts:40](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/doceoMepAggregator.ts#L40)

Aggregated per-MEP voting statistics derived from DOCEO RCV data.

## Properties

### abstentions

> **abstentions**: `number`

Defined in: [utils/doceoMepAggregator.ts:48](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/doceoMepAggregator.ts#L48)

RCV votes the MEP cast as ABSTAIN.

***

### attendanceRate

> **attendanceRate**: `number`

Defined in: [utils/doceoMepAggregator.ts:53](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/doceoMepAggregator.ts#L53)

Participation rate as `totalVotes / rcvVotesInspected * 100`. When no DOCEO
RCV votes were inspected, returns 0.

***

### loyaltyScore

> **loyaltyScore**: `number` \| `null`

Defined in: [utils/doceoMepAggregator.ts:59](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/doceoMepAggregator.ts#L59)

% of decisive votes (FOR/AGAINST) where the MEP voted with the
majority of their political group. `null` when the group cannot
be resolved from the MEP details or no DOCEO data was available.

***

### rcvVotesInspected

> **rcvVotesInspected**: `number`

Defined in: [utils/doceoMepAggregator.ts:61](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/doceoMepAggregator.ts#L61)

Total number of RCV votes inspected from DOCEO for the period.

***

### totalVotes

> **totalVotes**: `number`

Defined in: [utils/doceoMepAggregator.ts:42](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/doceoMepAggregator.ts#L42)

Number of RCV votes considered (where the MEP appeared on the roll).

***

### votesAgainst

> **votesAgainst**: `number`

Defined in: [utils/doceoMepAggregator.ts:46](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/doceoMepAggregator.ts#L46)

RCV votes the MEP cast as AGAINST.

***

### votesFor

> **votesFor**: `number`

Defined in: [utils/doceoMepAggregator.ts:44](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/doceoMepAggregator.ts#L44)

RCV votes the MEP cast as FOR.
