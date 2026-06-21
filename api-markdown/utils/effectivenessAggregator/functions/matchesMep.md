[**European Parliament MCP Server API v1.3.26**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/effectivenessAggregator](../README.md) / matchesMep

# Function: matchesMep()

> **matchesMep**(`candidate`, `mepTokens`): `boolean`

Defined in: [utils/effectivenessAggregator.ts:120](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L120)

**`Internal`**

Tolerant author/MEP match.

Returns `true` when any normalised token from `mepId` matches the candidate
exactly, or when the candidate contains a normalised token as a substring
(case-insensitive). Empty / undefined candidates never match.

## Parameters

### candidate

`string` \| `null` \| `undefined`

### mepTokens

`string`[]

## Returns

`boolean`
