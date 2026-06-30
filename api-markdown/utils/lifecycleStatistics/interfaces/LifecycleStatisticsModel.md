[**European Parliament MCP Server API v1.3.31**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/lifecycleStatistics](../README.md) / LifecycleStatisticsModel

# Interface: LifecycleStatisticsModel

Defined in: [utils/lifecycleStatistics.ts:75](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/lifecycleStatistics.ts#L75)

Full lifecycle model built from a corpus of procedures.

## Properties

### builtAt

> **builtAt**: `number`

Defined in: [utils/lifecycleStatistics.ts:85](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/lifecycleStatistics.ts#L85)

Timestamp the model was built (epoch ms).

***

### byTypeAndStage

> **byTypeAndStage**: `ReadonlyMap`\<`string`, [`StageDwellStatistics`](StageDwellStatistics.md)\>

Defined in: [utils/lifecycleStatistics.ts:77](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/lifecycleStatistics.ts#L77)

Keyed by `${procedureType}::${stage}` — deterministic ordering.

***

### computationTimeMs

> **computationTimeMs**: `number`

Defined in: [utils/lifecycleStatistics.ts:83](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/lifecycleStatistics.ts#L83)

Wall-clock duration of the corpus build, in milliseconds.

***

### corpusSize

> **corpusSize**: `number`

Defined in: [utils/lifecycleStatistics.ts:79](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/lifecycleStatistics.ts#L79)

Total number of procedures inspected (after filtering for ≥2 events).

***

### totalObservations

> **totalObservations**: `number`

Defined in: [utils/lifecycleStatistics.ts:81](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/lifecycleStatistics.ts#L81)

Total number of dwell observations across all keys.
