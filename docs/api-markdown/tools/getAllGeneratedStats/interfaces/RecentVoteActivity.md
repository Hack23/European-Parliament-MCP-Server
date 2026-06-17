[**European Parliament MCP Server API v1.3.24**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getAllGeneratedStats](../README.md) / RecentVoteActivity

# Interface: RecentVoteActivity

Defined in: [tools/getAllGeneratedStats.ts:221](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getAllGeneratedStats.ts#L221)

Recent DOCEO vote activity stats appended to the precomputed response.

## Properties

### adoptedCount

> **adoptedCount**: `number`

Defined in: [tools/getAllGeneratedStats.ts:223](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getAllGeneratedStats.ts#L223)

***

### adoptionRate

> **adoptionRate**: `number`

Defined in: [tools/getAllGeneratedStats.ts:226](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getAllGeneratedStats.ts#L226)

Adoption rate as a percentage (0-100, one decimal place).

***

### dataFreshness

> **dataFreshness**: `"NEAR_REALTIME"`

Defined in: [tools/getAllGeneratedStats.ts:231](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getAllGeneratedStats.ts#L231)

***

### dataSource

> **dataSource**: `"EP_DOCEO_XML"`

Defined in: [tools/getAllGeneratedStats.ts:232](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getAllGeneratedStats.ts#L232)

***

### datesWithData

> **datesWithData**: `string`[]

Defined in: [tools/getAllGeneratedStats.ts:227](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getAllGeneratedStats.ts#L227)

***

### datesWithoutData

> **datesWithoutData**: `string`[]

Defined in: [tools/getAllGeneratedStats.ts:228](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getAllGeneratedStats.ts#L228)

***

### groupVotingLeaders

> **groupVotingLeaders**: `object`[]

Defined in: [tools/getAllGeneratedStats.ts:230](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getAllGeneratedStats.ts#L230)

Top-3 political groups by total vote participation across recent plenary sittings.

#### group

> **group**: `string`

#### totalVotes

> **totalVotes**: `number`

***

### recentVoteCount

> **recentVoteCount**: `number`

Defined in: [tools/getAllGeneratedStats.ts:222](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getAllGeneratedStats.ts#L222)

***

### rejectedCount

> **rejectedCount**: `number`

Defined in: [tools/getAllGeneratedStats.ts:224](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getAllGeneratedStats.ts#L224)
