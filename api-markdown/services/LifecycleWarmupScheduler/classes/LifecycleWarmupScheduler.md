[**European Parliament MCP Server API v1.3.25**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [services/LifecycleWarmupScheduler](../README.md) / LifecycleWarmupScheduler

# Class: LifecycleWarmupScheduler

Defined in: [services/LifecycleWarmupScheduler.ts:108](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/LifecycleWarmupScheduler.ts#L108)

Out-of-band warmup scheduler for the lifecycle-statistics cache.

Typical lifecycle:
```typescript
const scheduler = new LifecycleWarmupScheduler();
scheduler.start();                 // production
scheduler.start({ disable: true }); // tests
await scheduler.refreshNow();       // explicit, returns once the
                                    // in-flight rebuild settles
scheduler.dispose();                // shutdown
```

`refreshNow()` returns a promise that callers can await for explicit
priming on startup; failures are logged but never thrown so a transient
EP-API outage does not crash the server.

## Constructors

### Constructor

> **new LifecycleWarmupScheduler**(`intervalMs?`): `LifecycleWarmupScheduler`

Defined in: [services/LifecycleWarmupScheduler.ts:125](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/LifecycleWarmupScheduler.ts#L125)

#### Parameters

##### intervalMs?

`number`

Optional override for the warmup interval. When
  omitted, the value is resolved from `EP_LIFECYCLE_WARMUP_INTERVAL_MS`
  via [resolveLifecycleWarmupIntervalMs](../../../config/functions/resolveLifecycleWarmupIntervalMs.md) (clamped to
  `[60_000, 3_600_000]`). Tests may pass a small value directly.

#### Returns

`LifecycleWarmupScheduler`

## Properties

### failedAttempts

> `private` **failedAttempts**: `number` = `0`

Defined in: [services/LifecycleWarmupScheduler.ts:114](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/LifecycleWarmupScheduler.ts#L114)

***

### inFlight

> `private` **inFlight**: [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LifecycleWarmupOutcome`](../type-aliases/LifecycleWarmupOutcome.md)\> \| `null` = `null`

Defined in: [services/LifecycleWarmupScheduler.ts:110](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/LifecycleWarmupScheduler.ts#L110)

***

### intervalMs

> `private` `readonly` **intervalMs**: `number`

Defined in: [services/LifecycleWarmupScheduler.ts:111](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/LifecycleWarmupScheduler.ts#L111)

***

### lastRefreshErrorAt

> `private` **lastRefreshErrorAt**: `string` \| `null` = `null`

Defined in: [services/LifecycleWarmupScheduler.ts:116](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/LifecycleWarmupScheduler.ts#L116)

***

### lastRefreshErrorMessage

> `private` **lastRefreshErrorMessage**: `string` \| `null` = `null`

Defined in: [services/LifecycleWarmupScheduler.ts:117](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/LifecycleWarmupScheduler.ts#L117)

***

### lastSuccessAt

> `private` **lastSuccessAt**: `string` \| `null` = `null`

Defined in: [services/LifecycleWarmupScheduler.ts:115](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/LifecycleWarmupScheduler.ts#L115)

***

### successfulAttempts

> `private` **successfulAttempts**: `number` = `0`

Defined in: [services/LifecycleWarmupScheduler.ts:113](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/LifecycleWarmupScheduler.ts#L113)

***

### timer

> `private` **timer**: `Timeout` \| `null` = `null`

Defined in: [services/LifecycleWarmupScheduler.ts:109](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/LifecycleWarmupScheduler.ts#L109)

***

### totalAttempts

> `private` **totalAttempts**: `number` = `0`

Defined in: [services/LifecycleWarmupScheduler.ts:112](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/LifecycleWarmupScheduler.ts#L112)

## Methods

### dispose()

> **dispose**(): `void`

Defined in: [services/LifecycleWarmupScheduler.ts:164](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/LifecycleWarmupScheduler.ts#L164)

Stop the periodic refresh and clear the timer. Any in-flight refresh is
left to settle on its own (the underlying `getLifecycleStatistics`
promise is not cancellable). Safe to call multiple times.

#### Returns

`void`

***

### getStatus()

> **getStatus**(): [`LifecycleWarmupSchedulerStatus`](../interfaces/LifecycleWarmupSchedulerStatus.md)

Defined in: [services/LifecycleWarmupScheduler.ts:228](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/LifecycleWarmupScheduler.ts#L228)

Diagnostic snapshot of the scheduler — consumed by `get_server_health`.

#### Returns

[`LifecycleWarmupSchedulerStatus`](../interfaces/LifecycleWarmupSchedulerStatus.md)

***

### refreshNow()

> **refreshNow**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LifecycleWarmupOutcome`](../type-aliases/LifecycleWarmupOutcome.md)\>

Defined in: [services/LifecycleWarmupScheduler.ts:184](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/LifecycleWarmupScheduler.ts#L184)

Run a single warmup attempt immediately.

If a warmup is already in-flight the existing promise is returned so
concurrent callers share the rebuild (de-duplication mirrors the
`getLifecycleStatistics` in-flight mutex). Errors are logged via
`console.error` and returned as `{ kind: 'error' }`; they never throw
out of this method so the scheduler stays alive across transient
EP-API failures.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LifecycleWarmupOutcome`](../type-aliases/LifecycleWarmupOutcome.md)\>

Outcome of the attempt (success counts, in-flight share, or
  sanitised error message).

***

### start()

> **start**(`options?`): `void`

Defined in: [services/LifecycleWarmupScheduler.ts:142](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/LifecycleWarmupScheduler.ts#L142)

Start the periodic refresh. The first refresh runs as soon as the timer
fires (callers wanting immediate priming should `await refreshNow()`
first). Calling `start()` more than once is a no-op once running.

The interval is `unref()`'d so it does not keep the Node.js event loop
alive on its own — CLI scripts and tests can still exit cleanly without
an explicit `dispose()`.

#### Parameters

##### options?

[`LifecycleWarmupSchedulerStartOptions`](../interfaces/LifecycleWarmupSchedulerStartOptions.md) = `{}`

#### Returns

`void`
