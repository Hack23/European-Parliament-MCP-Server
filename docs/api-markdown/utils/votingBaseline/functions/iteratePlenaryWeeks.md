[**European Parliament MCP Server API v1.3.27**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/votingBaseline](../README.md) / iteratePlenaryWeeks

# Function: iteratePlenaryWeeks()

> **iteratePlenaryWeeks**(`from`, `to`): `string`[]

Defined in: [utils/votingBaseline.ts:581](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L581)

Enumerate the Monday (ISO-week start, UTC) of every plenary week whose
Mon–Fri span intersects the inclusive `[from, to]` date range.

Used by `detect_voting_anomalies` to drive the multi-week DOCEO fetch loop
so the per-MEP rolling baseline reflects every plenary week in the requested
window rather than the single week containing `to`.

Behaviour:

- Returns an empty array when either bound is missing/empty or unparsable.
- Returns an empty array when `from > to`.
- A week is included only when its Mon–Fri span intersects `[from, to]`
  (i.e. `weekStart + 4d >= from`). This prevents `from` on Sat/Sun from
  pulling in the prior week, whose Friday ended before `from`.
- Weeks are ordered chronologically (oldest first) for stable iteration.
- Capped at [MAX\_PLENARY\_WEEKS](../variables/MAX_PLENARY_WEEKS.md) (≈6 months) per request, retaining
  the *most recent* in-scope weeks (enumeration walks backward from `to`
  and is then reversed). Callers should treat `result.length ===
  MAX_PLENARY_WEEKS` AND a wider input window as truncation and surface a
  `weeksTruncated` warning.

## Parameters

### from

`string`

Inclusive period start (YYYY-MM-DD).

### to

`string`

Inclusive period end (YYYY-MM-DD).

## Returns

`string`[]

Mondays of intersecting plenary weeks, oldest first.
