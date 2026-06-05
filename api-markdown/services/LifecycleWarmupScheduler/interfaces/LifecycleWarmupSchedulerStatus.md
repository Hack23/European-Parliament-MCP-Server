[**European Parliament MCP Server API v1.3.15**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [services/LifecycleWarmupScheduler](../README.md) / LifecycleWarmupSchedulerStatus

# Interface: LifecycleWarmupSchedulerStatus

Defined in: [services/LifecycleWarmupScheduler.ts:63](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/LifecycleWarmupScheduler.ts#L63)

Observable status of the scheduler.

## Properties

### failedAttempts

> **failedAttempts**: `number`

Defined in: [services/LifecycleWarmupScheduler.ts:73](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/LifecycleWarmupScheduler.ts#L73)

Warmups that ended in a thrown error.

***

### intervalMs

> **intervalMs**: `number`

Defined in: [services/LifecycleWarmupScheduler.ts:67](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/LifecycleWarmupScheduler.ts#L67)

Effective interval (ms) used by the timer; reflects clamped env value.

***

### lastRefreshErrorAt

> **lastRefreshErrorAt**: `string` \| `null`

Defined in: [services/LifecycleWarmupScheduler.ts:83](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/LifecycleWarmupScheduler.ts#L83)

ISO-8601 timestamp of the most recent failed warmup, or `null` when no
warmup has ever failed.

***

### lastRefreshErrorMessage

> **lastRefreshErrorMessage**: `string` \| `null`

Defined in: [services/LifecycleWarmupScheduler.ts:88](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/LifecycleWarmupScheduler.ts#L88)

Sanitised error message from the most recent failure, or `null` when no
warmup has failed.

***

### lastSuccessAt

> **lastSuccessAt**: `string` \| `null`

Defined in: [services/LifecycleWarmupScheduler.ts:78](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/LifecycleWarmupScheduler.ts#L78)

ISO-8601 timestamp of the most recent successful warmup, or `null` when
no warmup has ever succeeded.

***

### running

> **running**: `boolean`

Defined in: [services/LifecycleWarmupScheduler.ts:65](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/LifecycleWarmupScheduler.ts#L65)

Whether the interval timer is currently scheduling refreshes.

***

### successfulAttempts

> **successfulAttempts**: `number`

Defined in: [services/LifecycleWarmupScheduler.ts:71](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/LifecycleWarmupScheduler.ts#L71)

Successful warmups (no error thrown by `getLifecycleStatistics`).

***

### totalAttempts

> **totalAttempts**: `number`

Defined in: [services/LifecycleWarmupScheduler.ts:69](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/LifecycleWarmupScheduler.ts#L69)

Total number of warmup attempts that have completed since `start()`.
