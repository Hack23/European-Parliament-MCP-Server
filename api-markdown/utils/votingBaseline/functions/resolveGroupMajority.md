[**European Parliament MCP Server API v1.3.26**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/votingBaseline](../README.md) / resolveGroupMajority

# Function: resolveGroupMajority()

> **resolveGroupMajority**(`row`): [`VotePosition`](../type-aliases/VotePosition.md) \| `null`

Defined in: [utils/votingBaseline.ts:168](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L168)

Resolve the plurality position of a group-breakdown row.

Ties are broken alphabetically (ABSTAIN < AGAINST < FOR) so the result is
deterministic and fixture-stable.

## Parameters

### row

\{ `abstain`: `number`; `against`: `number`; `for`: `number`; \} \| `undefined`

DOCEO group-breakdown counts. `undefined` for groups absent
  from the vote.

## Returns

[`VotePosition`](../type-aliases/VotePosition.md) \| `null`

Plurality position or `null` when the row is missing or all zero.
