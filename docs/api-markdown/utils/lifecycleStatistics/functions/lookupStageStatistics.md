[**European Parliament MCP Server API v1.4.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/lifecycleStatistics](../README.md) / lookupStageStatistics

# Function: lookupStageStatistics()

> **lookupStageStatistics**(`model`, `procedureType`, `stage`): [`StageDwellStatistics`](../interfaces/StageDwellStatistics.md) \| `undefined`

Defined in: [utils/lifecycleStatistics.ts:353](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/lifecycleStatistics.ts#L353)

Lookup statistics for a `(procedureType, stage)` pair.

Performs an exact lookup by `lifecycleKey(procedureType, normalizedStage)`.
Returns `undefined` when no matching cell exists or the cell has zero
samples, so callers must handle the missing-data case explicitly.

## Parameters

### model

[`LifecycleStatisticsModel`](../interfaces/LifecycleStatisticsModel.md)

The lifecycle statistics model

### procedureType

`string`

The procedure type (e.g. `COD`)

### stage

`string`

Normalized stage key

## Returns

[`StageDwellStatistics`](../interfaces/StageDwellStatistics.md) \| `undefined`

Stage statistics, or `undefined` when no usable data exists
