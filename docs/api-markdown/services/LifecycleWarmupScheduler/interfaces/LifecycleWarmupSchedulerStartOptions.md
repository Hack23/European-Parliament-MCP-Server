[**European Parliament MCP Server API v1.3.31**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [services/LifecycleWarmupScheduler](../README.md) / LifecycleWarmupSchedulerStartOptions

# Interface: LifecycleWarmupSchedulerStartOptions

Defined in: [services/LifecycleWarmupScheduler.ts:43](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/LifecycleWarmupScheduler.ts#L43)

Options accepted by [LifecycleWarmupScheduler.start](../classes/LifecycleWarmupScheduler.md#start).

## Properties

### disable?

> `optional` **disable?**: `boolean`

Defined in: [services/LifecycleWarmupScheduler.ts:50](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/LifecycleWarmupScheduler.ts#L50)

Disable the interval timer entirely. Intended for unit tests that need
deterministic, hermetic execution without background work. When `true`,
`start()` is a no-op and [LifecycleWarmupScheduler.getStatus](../classes/LifecycleWarmupScheduler.md#getstatus)
continues to reflect the existing cache.
