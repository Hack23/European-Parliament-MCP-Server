[**European Parliament MCP Server API v1.3.10**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [services/LifecycleWarmupScheduler](../README.md) / LifecycleWarmupOutcome

# Type Alias: LifecycleWarmupOutcome

> **LifecycleWarmupOutcome** = \{ `corpusSize`: `number`; `durationMs`: `number`; `kind`: `"success"`; `totalObservations`: `number`; \} \| \{ `kind`: `"in-flight"`; \} \| \{ `durationMs`: `number`; `errorMessage`: `string`; `kind`: `"error"`; \}

Defined in: [services/LifecycleWarmupScheduler.ts:57](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/LifecycleWarmupScheduler.ts#L57)

Outcome of a single warmup attempt. Exposed for tests and for the
scheduler's own status reporting.
