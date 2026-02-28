[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [data/generatedStats](../README.md) / PoliticalLandscapeData

# Interface: PoliticalLandscapeData

Defined in: [data/generatedStats.ts:61](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L61)

## Properties

### fragmentationIndex

> **fragmentationIndex**: `number`

Defined in: [data/generatedStats.ts:81](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L81)

Effective Number of Parliamentary Parties (Laakso-Taagepera index)

***

### grandCoalitionPossible

> **grandCoalitionPossible**: `boolean`

Defined in: [data/generatedStats.ts:83](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L83)

Whether any two groups can form a majority

***

### groups

> **groups**: [`PoliticalGroupSnapshot`](PoliticalGroupSnapshot.md)[]

Defined in: [data/generatedStats.ts:70](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L70)

Political groups in the parliament for this year.

This array includes all recognised political groups and may also
contain an `NI` (non-attached members) entry when applicable.
The `NI` entry represents MEPs not attached to any political group
and is not counted in `totalGroups`.

***

### largestGroup

> **largestGroup**: `string`

Defined in: [data/generatedStats.ts:77](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L77)

Largest group name

***

### largestGroupSeatShare

> **largestGroupSeatShare**: `number`

Defined in: [data/generatedStats.ts:79](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L79)

Largest group seat share (0–100)

***

### politicalBalance

> **politicalBalance**: `string`

Defined in: [data/generatedStats.ts:85](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L85)

Political balance: centre-right vs centre-left vs other

***

### totalGroups

> **totalGroups**: `number`

Defined in: [data/generatedStats.ts:75](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L75)

Total number of recognised political groups (excluding non-attached
members, i.e. the `NI` entry in `groups` when present).
