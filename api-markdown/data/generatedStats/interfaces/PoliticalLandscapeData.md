[**European Parliament MCP Server API v1.3.27**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [data/generatedStats](../README.md) / PoliticalLandscapeData

# Interface: PoliticalLandscapeData

Defined in: [data/generatedStats.ts:67](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L67)

Snapshot of the political landscape of the European Parliament for a
single year: composition of political groups, fragmentation metrics,
coalition viability indicators, and turnover statistics.

Used by [GENERATED\_STATS](../variables/GENERATED_STATS.md) as the per-year landscape record and
surfaced by the `get_all_generated_stats` MCP tool.

## Properties

### fragmentationIndex

> **fragmentationIndex**: `number`

Defined in: [data/generatedStats.ts:87](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L87)

Effective Number of Parliamentary Parties (Laakso-Taagepera index)

***

### grandCoalitionPossible

> **grandCoalitionPossible**: `boolean`

Defined in: [data/generatedStats.ts:89](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L89)

Whether any two groups can form a majority

***

### groups

> **groups**: [`PoliticalGroupSnapshot`](PoliticalGroupSnapshot.md)[]

Defined in: [data/generatedStats.ts:76](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L76)

Political groups in the parliament for this year.

This array includes all recognised political groups and may also
contain an `NI` (non-attached members) entry when applicable.
The `NI` entry represents MEPs not attached to any political group
and is not counted in `totalGroups`.

***

### largestGroup

> **largestGroup**: `string`

Defined in: [data/generatedStats.ts:83](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L83)

Largest group name

***

### largestGroupSeatShare

> **largestGroupSeatShare**: `number`

Defined in: [data/generatedStats.ts:85](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L85)

Largest group seat share (0–100)

***

### politicalBalance

> **politicalBalance**: `string`

Defined in: [data/generatedStats.ts:91](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L91)

Political balance: centre-right vs centre-left vs other

***

### totalGroups

> **totalGroups**: `number`

Defined in: [data/generatedStats.ts:81](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L81)

Total number of recognised political groups (excluding non-attached
members, i.e. the `NI` entry in `groups` when present).
