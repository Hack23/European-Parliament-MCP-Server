[**European Parliament MCP Server API v1.3.16**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / clients/ep/abortUtils

# clients/ep/abortUtils

## Fileoverview

AbortSignal linking helpers shared across EP HTTP clients.

Both BaseEPClient and DoceoClient need to compose an
externally-provided cancellation `AbortSignal` (typically the inner signal
exposed by withTimeoutAndAbort in OSINT tools) with an internally
managed controller (the per-request timeout controller). Extracting the
helper here ensures both call sites use identical event-listener and
cleanup semantics — preventing leaks and double-abort regressions.

**ISMS Policies:**
- SC-002 (Secure Coding Standards) — bounded, cancellable network I/O
- PE-001 (Performance Standards) — pre-emptive cancellation frees rate-
  limiter tokens and connection slots when an upstream deadline expires

## See

https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md

## Interfaces

- [LinkedAbortController](interfaces/LinkedAbortController.md)

## Functions

- [createLinkedAbortController](functions/createLinkedAbortController.md)
