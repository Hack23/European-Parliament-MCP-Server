[**European Parliament MCP Server API v0.8.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/jsonLdHelpers](../README.md) / determineVoteOutcome

# Function: determineVoteOutcome()

> **determineVoteOutcome**(`decisionStr`, `votesFor`, `votesAgainst`): `"ADOPTED"` \| `"REJECTED"`

Defined in: [clients/ep/jsonLdHelpers.ts:278](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/clients/ep/jsonLdHelpers.ts#L278)

Determines vote outcome from EP API decision string.

## Parameters

### decisionStr

`string`

Raw decision string from EP API

### votesFor

`number`

Number of votes for

### votesAgainst

`number`

Number of votes against

## Returns

`"ADOPTED"` \| `"REJECTED"`

`'ADOPTED'` or `'REJECTED'`
