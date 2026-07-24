[**European Parliament MCP Server API v1.4.5**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/weeklyCacheState](../README.md) / refreshDetailBatch

# Function: refreshDetailBatch()

> **refreshDetailBatch**\<`Item`\>(`options`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`DetailBatchResult`](../interfaces/DetailBatchResult.md)\>

Defined in: [utils/weeklyCacheState.ts:174](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/weeklyCacheState.ts#L174)

Fetches detail records for up to `batchSize` items that have neither been
cached nor flagged missing, mutating `details` and `missingIds` in place.

## Type Parameters

### Item

`Item`

## Parameters

### options

[`DetailBatchOptions`](../interfaces/DetailBatchOptions.md)\<`Item`\>

Batch configuration and mutable state.

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`DetailBatchResult`](../interfaces/DetailBatchResult.md)\>

Counts describing this run's progress and whether the cache is complete.
