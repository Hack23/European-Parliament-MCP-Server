[**European Parliament MCP Server API v1.1.27**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/mepFetcher](../README.md) / FetchMEPsResult

# Interface: FetchMEPsResult

Defined in: [utils/mepFetcher.ts:20](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/mepFetcher.ts#L20)

Result of a paginated MEP fetch. Callers should inspect `complete` to
determine whether the returned `meps` array represents a full dataset
or only a partial snapshot (due to a pagination error).

## Properties

### complete

> **complete**: `boolean`

Defined in: [utils/mepFetcher.ts:24](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/mepFetcher.ts#L24)

`true` when all pages were fetched successfully; `false` on error.

***

### meps

> **meps**: [`MEP`](../../../types/ep/mep/interfaces/MEP.md)[]

Defined in: [utils/mepFetcher.ts:22](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/mepFetcher.ts#L22)

MEPs collected so far (may be partial on error).

***

### failureOffset?

> `optional` **failureOffset?**: `number`

Defined in: [utils/mepFetcher.ts:26](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/mepFetcher.ts#L26)

The offset at which a failure occurred, if any.
