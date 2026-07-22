[**European Parliament MCP Server API v1.4.4**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/lifecycleStatistics](../README.md) / buildLifecycleStatistics

# Function: buildLifecycleStatistics()

> **buildLifecycleStatistics**(`procedures`, `eventsByProcedureId`): [`LifecycleStatisticsModel`](../interfaces/LifecycleStatisticsModel.md)

Defined in: [utils/lifecycleStatistics.ts:299](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/lifecycleStatistics.ts#L299)

Build the lifecycle statistics model from a procedure corpus and their
event timelines.

Deterministic: identical input procedures and events produce identical
statistics (the model is independent of `Map` insertion order — only the
`byTypeAndStage` map's `Map`/`Object.entries` iteration order may differ,
but the per-key values are stable).

## Parameters

### procedures

readonly [`Procedure`](../../../types/ep/activities/interfaces/Procedure.md)[]

The corpus of procedures

### eventsByProcedureId

`ReadonlyMap`\<`string`, [`EPEvent`](../../../types/ep/activities/interfaces/EPEvent.md)[]\>

Event timelines fetched via [fetchEventsBounded](fetchEventsBounded.md)

## Returns

[`LifecycleStatisticsModel`](../interfaces/LifecycleStatisticsModel.md)

Frozen lifecycle statistics model
