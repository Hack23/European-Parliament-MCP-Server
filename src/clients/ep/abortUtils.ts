/**
 * @fileoverview AbortSignal linking helpers shared across EP HTTP clients.
 *
 * Both {@link BaseEPClient} and {@link DoceoClient} need to compose an
 * externally-provided cancellation `AbortSignal` (typically the inner signal
 * exposed by {@link withTimeoutAndAbort} in OSINT tools) with an internally
 * managed controller (the per-request timeout controller). Extracting the
 * helper here ensures both call sites use identical event-listener and
 * cleanup semantics — preventing leaks and double-abort regressions.
 *
 * **ISMS Policies:**
 * - SC-002 (Secure Coding Standards) — bounded, cancellable network I/O
 * - PE-001 (Performance Standards) — pre-emptive cancellation frees rate-
 *   limiter tokens and connection slots when an upstream deadline expires
 *
 * @module clients/ep/abortUtils
 * @see https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md
 */

/**
 * Result of {@link createLinkedAbortController}.
 *
 * @property controller - The internal {@link AbortController} whose `signal`
 *   should be passed to `fetch`. Aborts when either the external signal aborts
 *   or the caller invokes `controller.abort()` directly (e.g. on timeout).
 * @property cleanup - Idempotent cleanup function that removes the external
 *   signal's `abort` listener. MUST be called in a `finally` block after the
 *   fetch settles to avoid retaining listeners on long-lived external signals.
 */
export interface LinkedAbortController {
  readonly controller: AbortController;
  readonly cleanup: () => void;
}

/**
 * Creates an {@link AbortController} whose signal is linked to an optional
 * external {@link AbortSignal}.
 *
 * Behaviour:
 * - If `externalSignal` is `undefined`, returns a fresh controller with a
 *   no-op `cleanup`.
 * - If `externalSignal` is already aborted, the returned controller is
 *   pre-aborted; `cleanup` is a no-op.
 * - Otherwise, listens once for the external signal's `abort` event and
 *   forwards it to the controller. `cleanup` removes the listener.
 *
 * The internal controller MAY be aborted directly by the caller (e.g. to
 * apply a per-request timeout) without affecting the external signal —
 * propagation is one-way (external → internal).
 *
 * @param externalSignal - Optional caller-provided cancellation signal
 * @returns A {@link LinkedAbortController}
 *
 * @security Cleanup MUST be invoked after the awaited operation completes —
 *   leaving a listener attached to a long-lived signal would retain a
 *   reference to the controller and any captured closure state.
 */
export function createLinkedAbortController(
  externalSignal?: AbortSignal,
): LinkedAbortController {
  const controller = new AbortController();
  if (externalSignal === undefined) {
    return { controller, cleanup: (): void => undefined };
  }

  if (externalSignal.aborted) {
    controller.abort();
    return { controller, cleanup: (): void => undefined };
  }

  const abort = (): void => { controller.abort(); };
  externalSignal.addEventListener('abort', abort, { once: true });
  return {
    controller,
    cleanup: (): void => { externalSignal.removeEventListener('abort', abort); },
  };
}
