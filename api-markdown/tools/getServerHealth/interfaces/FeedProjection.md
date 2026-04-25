[**European Parliament MCP Server API v1.2.14**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getServerHealth](../README.md) / FeedProjection

# Interface: FeedProjection

Defined in: [tools/getServerHealth.ts:39](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getServerHealth.ts#L39)

Per-feed projection used in the `get_server_health` response.

Preserves the existing `lastSuccess` / `lastError` / `lastAttempt`
fields (backward compatible) and adds a `lastProbedAt` alias for
`lastAttempt` so consumers can judge cache staleness
(see issue #1, recommendation 3).

## Properties

### status

> **status**: `"unknown"` \| `"error"` \| `"ok"`

Defined in: [tools/getServerHealth.ts:40](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getServerHealth.ts#L40)

***

### lastAttempt?

> `optional` **lastAttempt?**: `string`

Defined in: [tools/getServerHealth.ts:41](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getServerHealth.ts#L41)

***

### lastError?

> `optional` **lastError?**: `string`

Defined in: [tools/getServerHealth.ts:44](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getServerHealth.ts#L44)

***

### lastProbedAt?

> `optional` **lastProbedAt?**: `string`

Defined in: [tools/getServerHealth.ts:42](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getServerHealth.ts#L42)

***

### lastSuccess?

> `optional` **lastSuccess?**: `string`

Defined in: [tools/getServerHealth.ts:43](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getServerHealth.ts#L43)
