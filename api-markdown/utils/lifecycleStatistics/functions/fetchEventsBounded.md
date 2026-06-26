[**European Parliament MCP Server API v1.3.29**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/lifecycleStatistics](../README.md) / fetchEventsBounded

# Function: fetchEventsBounded()

> **fetchEventsBounded**(`procedures`, `concurrency?`, `deadline?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Map`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, [`EPEvent`](../../../types/ep/activities/interfaces/EPEvent.md)[]\>\>

Defined in: [utils/lifecycleStatistics.ts:261](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/lifecycleStatistics.ts#L261)

Fetch event sequences for a list of procedures with bounded concurrency.

Uses `Promise.allSettled` so a single 404 or transient error does not abort
the whole corpus build — failures are silently skipped (their contribution
to the distribution is simply omitted).

## Parameters

### procedures

readonly [`Procedure`](../../../types/ep/activities/interfaces/Procedure.md)[]

Procedures to enrich with their event timeline

### concurrency?

`number` = `EVENT_FETCH_CONCURRENCY`

Maximum parallel fetches (≤8 recommended)

### deadline?

`number`

Optional wall-clock deadline (epoch ms). If `Date.now()`
  exceeds the deadline between batches, the loop short-circuits and the
  partial result is returned. This is the corpus rebuild's cooperative
  cancellation mechanism: when the request-path budget fires, this
  function stops queueing further events fetches so it no longer competes
  with the request's own rate-limited calls.

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Map`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, [`EPEvent`](../../../types/ep/activities/interfaces/EPEvent.md)[]\>\>

Map of process-id → events array (failed fetches are absent;
  procedures whose batch never ran due to the deadline are also absent)
