[**European Parliament MCP Server API v1.3.32**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/abortUtils](../README.md) / LinkedAbortController

# Interface: LinkedAbortController

Defined in: [clients/ep/abortUtils.ts:30](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/abortUtils.ts#L30)

Result of [createLinkedAbortController](../functions/createLinkedAbortController.md).

## Properties

### cleanup

> `readonly` **cleanup**: () => `void`

Defined in: [clients/ep/abortUtils.ts:32](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/abortUtils.ts#L32)

Idempotent cleanup function that removes the external
  signal's `abort` listener. MUST be called in a `finally` block after the
  fetch settles to avoid retaining listeners on long-lived external signals.

#### Returns

`void`

***

### controller

> `readonly` **controller**: `AbortController`

Defined in: [clients/ep/abortUtils.ts:31](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/abortUtils.ts#L31)

The internal AbortController whose `signal`
  should be passed to `fetch`. Aborts when either the external signal aborts
  or the caller invokes `controller.abort()` directly (e.g. on timeout).
