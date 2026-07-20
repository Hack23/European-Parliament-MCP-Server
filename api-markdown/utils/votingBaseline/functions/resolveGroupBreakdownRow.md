[**European Parliament MCP Server API v1.4.3**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/votingBaseline](../README.md) / resolveGroupBreakdownRow

# Function: resolveGroupBreakdownRow()

> **resolveGroupBreakdownRow**(`breakdown`, `normalizedGroup`): \{ `abstain`: `number`; `against`: `number`; `for`: `number`; \} \| `undefined`

Defined in: [utils/votingBaseline.ts:193](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L193)

**`Internal`**

Resolve the breakdown row for a normalized group label, handling the case
where DOCEO XML uses raw short labels (e.g. `RE`, `Verts/ALE`) while
`normalizedGroup` is the canonical EP code (`Renew`, `Greens/EFA`).

 Exported for testing.

## Parameters

### breakdown

`Record`\<`string`, \{ `abstain`: `number`; `against`: `number`; `for`: `number`; \}\> \| `undefined`

### normalizedGroup

`string`

## Returns

\{ `abstain`: `number`; `against`: `number`; `for`: `number`; \} \| `undefined`
