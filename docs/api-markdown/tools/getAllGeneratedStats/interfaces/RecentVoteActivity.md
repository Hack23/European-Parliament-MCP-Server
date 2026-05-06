[**European Parliament MCP Server API v1.3.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getAllGeneratedStats](../README.md) / RecentVoteActivity

# Interface: RecentVoteActivity

Defined in: [tools/getAllGeneratedStats.ts:214](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getAllGeneratedStats.ts#L214)

Recent DOCEO vote activity stats appended to the precomputed response.

## Properties

### adoptedCount

> **adoptedCount**: `number`

Defined in: [tools/getAllGeneratedStats.ts:216](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getAllGeneratedStats.ts#L216)

***

### adoptionRate

> **adoptionRate**: `number`

Defined in: [tools/getAllGeneratedStats.ts:219](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getAllGeneratedStats.ts#L219)

Adoption rate as a percentage (0-100, one decimal place).

***

### dataFreshness

> **dataFreshness**: `"NEAR_REALTIME"`

Defined in: [tools/getAllGeneratedStats.ts:224](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getAllGeneratedStats.ts#L224)

***

### dataSource

> **dataSource**: `"EP_DOCEO_XML"`

Defined in: [tools/getAllGeneratedStats.ts:225](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getAllGeneratedStats.ts#L225)

***

### datesWithData

> **datesWithData**: `string`[]

Defined in: [tools/getAllGeneratedStats.ts:220](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getAllGeneratedStats.ts#L220)

***

### datesWithoutData

> **datesWithoutData**: `string`[]

Defined in: [tools/getAllGeneratedStats.ts:221](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getAllGeneratedStats.ts#L221)

***

### groupVotingLeaders

> **groupVotingLeaders**: `object`[]

Defined in: [tools/getAllGeneratedStats.ts:223](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getAllGeneratedStats.ts#L223)

Top-3 political groups by total vote participation across recent plenary sittings.

#### group

> **group**: `string`

#### totalVotes

> **totalVotes**: `number`

***

### recentVoteCount

> **recentVoteCount**: `number`

Defined in: [tools/getAllGeneratedStats.ts:215](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getAllGeneratedStats.ts#L215)

***

### rejectedCount

> **rejectedCount**: `number`

Defined in: [tools/getAllGeneratedStats.ts:217](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getAllGeneratedStats.ts#L217)
