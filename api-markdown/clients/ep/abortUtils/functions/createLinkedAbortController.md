[**European Parliament MCP Server API v1.3.43**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/abortUtils](../README.md) / createLinkedAbortController

# Function: createLinkedAbortController()

> **createLinkedAbortController**(`externalSignal?`): [`LinkedAbortController`](../interfaces/LinkedAbortController.md)

Defined in: [clients/ep/abortUtils.ts:58](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/abortUtils.ts#L58)

Creates an AbortController whose signal is linked to an optional
external AbortSignal.

Behaviour:
- If `externalSignal` is `undefined`, returns a fresh controller with a
  no-op `cleanup`.
- If `externalSignal` is already aborted, the returned controller is
  pre-aborted; `cleanup` is a no-op.
- Otherwise, listens once for the external signal's `abort` event and
  forwards it to the controller. `cleanup` removes the listener.

The internal controller MAY be aborted directly by the caller (e.g. to
apply a per-request timeout) without affecting the external signal —
propagation is one-way (external → internal).

## Parameters

### externalSignal?

`AbortSignal`

Optional caller-provided cancellation signal

## Returns

[`LinkedAbortController`](../interfaces/LinkedAbortController.md)

A [LinkedAbortController](../interfaces/LinkedAbortController.md)

## Security

Cleanup MUST be invoked after the awaited operation completes —
  leaving a listener attached to a long-lived signal would retain a
  reference to the controller and any captured closure state.
