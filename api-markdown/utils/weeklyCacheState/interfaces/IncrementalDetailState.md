[**European Parliament MCP Server API v1.4.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/weeklyCacheState](../README.md) / IncrementalDetailState

# Interface: IncrementalDetailState

Defined in: [utils/weeklyCacheState.ts:19](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/weeklyCacheState.ts#L19)

Mutable state carried across a weekly refresh: the detail records fetched so
far (keyed by every identifier variant) and the identifiers that returned a
definitive "not found" and should not be retried this cycle.

## Properties

### details

> **details**: `Record`\<`string`, `unknown`\>

Defined in: [utils/weeklyCacheState.ts:20](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/weeklyCacheState.ts#L20)

***

### missingIds

> **missingIds**: `Set`\<`string`\>

Defined in: [utils/weeklyCacheState.ts:21](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/weeklyCacheState.ts#L21)
