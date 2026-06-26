[**European Parliament MCP Server API v1.3.29**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getServerHealth](../README.md) / LifecycleCacheProjection

# Interface: LifecycleCacheProjection

Defined in: [tools/getServerHealth.ts:76](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getServerHealth.ts#L76)

Lifecycle-statistics cache projection exposed in the health response.

| Field                 | Meaning |
|-----------------------|---------|
| `state`               | `WARM` (cached & fresh), `STALE` (cached but TTL elapsed), `COLD` (never warmed) |
| `ageMs`               | Age of the cached model in ms; `null` when COLD |
| `corpusSize`          | Number of procedures the cached model was built from; `null` when COLD |
| `lastRefreshErrorAt`  | ISO-8601 timestamp of the last warmup-scheduler failure; `null` when none |

## Properties

### ageMs

> **ageMs**: `number` \| `null`

Defined in: [tools/getServerHealth.ts:78](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getServerHealth.ts#L78)

***

### corpusSize

> **corpusSize**: `number` \| `null`

Defined in: [tools/getServerHealth.ts:79](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getServerHealth.ts#L79)

***

### lastRefreshErrorAt

> **lastRefreshErrorAt**: `string` \| `null`

Defined in: [tools/getServerHealth.ts:80](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getServerHealth.ts#L80)

***

### state

> **state**: [`LifecycleCacheState`](../../../utils/lifecycleStatistics/type-aliases/LifecycleCacheState.md)

Defined in: [tools/getServerHealth.ts:77](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getServerHealth.ts#L77)
