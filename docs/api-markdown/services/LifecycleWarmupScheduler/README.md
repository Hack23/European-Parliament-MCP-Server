[**European Parliament MCP Server API v1.3.12**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / services/LifecycleWarmupScheduler

# services/LifecycleWarmupScheduler

Lifecycle-Statistics Cache Warmup Scheduler.

Out-of-band refresh job that keeps the corpus-wide lifecycle-statistics
cache populated so import('../tools/monitorLegislativePipeline.js') monitor\_legislative\_pipeline — which reads from the cache only on the
request path — never has to degrade to `INSUFFICIENT_DATA` forecasts
because of a cold cache.

**Why a separate scheduler instead of an on-request rebuild?**
`monitor_legislative_pipeline` cannot afford to race the corpus rebuild
(`/procedures` + up to 500 `/procedures/{id}/events`) against its own
rate-limited `/events` fan-out: the token-bucket budget would be exhausted
before the tool's own queries land. The scheduler runs the rebuild
independently of any request, giving the cache a steady-state warm window.

**Concurrency.** The scheduler deduplicates concurrent `refreshNow()` calls
through its own `inFlight` promise so callers share a single warmup attempt.
Each warmup uses `getLifecycleStatistics({ forceRefresh: true })` to rebuild
the corpus out-of-band without relying on request-path cache misses.

**Test hermeticity.** `start()` accepts a `{ disable: true }` flag so unit
tests can opt out of the interval timer entirely. Internally the timer is
`unref()`'d so production/CLI process exits are not blocked.

ISMS Policy: AU-002 (Audit Logging), AC-003 (Least Privilege),
  SC-002 (Input Validation), A.8.16 (Monitoring activities)

## Classes

- [LifecycleWarmupScheduler](classes/LifecycleWarmupScheduler.md)

## Interfaces

- [LifecycleWarmupSchedulerStartOptions](interfaces/LifecycleWarmupSchedulerStartOptions.md)
- [LifecycleWarmupSchedulerStatus](interfaces/LifecycleWarmupSchedulerStatus.md)

## Type Aliases

- [LifecycleWarmupOutcome](type-aliases/LifecycleWarmupOutcome.md)

## Variables

- [lifecycleWarmupScheduler](variables/lifecycleWarmupScheduler.md)
