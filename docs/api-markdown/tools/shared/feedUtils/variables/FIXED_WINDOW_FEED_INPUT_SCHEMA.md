[**European Parliament MCP Server API v1.2.16**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/feedUtils](../README.md) / FIXED\_WINDOW\_FEED\_INPUT\_SCHEMA

# Variable: FIXED\_WINDOW\_FEED\_INPUT\_SCHEMA

> `const` **FIXED\_WINDOW\_FEED\_INPUT\_SCHEMA**: `object`

Defined in: [tools/shared/feedUtils.ts:132](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/feedUtils.ts#L132)

Shared MCP `tools/list` inputSchema for fixed-window feed tools
(Group A: `get_documents_feed`, `get_plenary_documents_feed`, etc.).

The underlying EP API endpoints do not accept `timeframe` / `startDate`
/ `limit` / `offset` and always serve a server-defined default window
(typically one month).  For contract uniformity with the sliding-window
feed tools (Group B), this schema still advertises those parameters —
they are accepted by the Zod validator but silently ignored at the
upstream call site.  See `FixedWindowFeedSchema` in
`src/schemas/ep/feed.ts`.

## Type Declaration

### properties

> **properties**: `object`

#### properties.limit

> **limit**: `object`

#### properties.limit.description

> **description**: `string` = `'Informational-only — the upstream EP API does not paginate this fixed-window feed. Accepted for contract uniformity.'`

#### properties.limit.maximum

> **maximum**: `number` = `100`

#### properties.limit.minimum

> **minimum**: `number` = `1`

#### properties.limit.type

> **type**: `string` = `'number'`

#### properties.offset

> **offset**: `object`

#### properties.offset.description

> **description**: `string` = `'Informational-only — the upstream EP API does not paginate this fixed-window feed. Accepted for contract uniformity.'`

#### properties.offset.minimum

> **minimum**: `number` = `0`

#### properties.offset.type

> **type**: `string` = `'number'`

#### properties.startDate

> **startDate**: `object`

#### properties.startDate.description

> **description**: `string` = `'Informational-only — ignored by this fixed-window feed. Accepted for contract uniformity with sliding-window feed tools.'`

#### properties.startDate.type

> **type**: `string` = `'string'`

#### properties.timeframe

> **timeframe**: `object`

#### properties.timeframe.description

> **description**: `string` = `'Informational-only — this feed uses a server-defined default window (typically one month) and ignores this parameter. Accepted for contract uniformity with sliding-window feed tools.'`

#### properties.timeframe.enum

> **enum**: `string`[]

#### properties.timeframe.type

> **type**: `string` = `'string'`

### type

> **type**: `"object"`
