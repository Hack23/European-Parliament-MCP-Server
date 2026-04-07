/**
 * Shared error handling utilities for MCP tool handlers.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import type { ToolResult } from './types.js';
import { buildErrorResponse } from './responseBuilder.js';
import { ToolError } from './errors.js';
import { APIError } from '../../clients/ep/baseClient.js';
import { TimeoutError } from '../../utils/timeout.js';

/**
 * Checks whether an error represents an EP API request timeout.
 *
 * Detects timeouts regardless of how deeply they are wrapped by
 * recursively walking the `cause` chain:
 * - Direct `TimeoutError`
 * - `APIError` with status 408 (produced by `baseClient.toAPIError`)
 * - `ToolError` or `Error` whose `cause` is any of the above (at any depth)
 *
 * @param error - Caught error value
 * @returns `true` when the root cause is a timeout
 */
export function isTimeoutRelatedError(error: unknown): boolean {
  if (error instanceof TimeoutError) return true;
  if (error instanceof APIError && error.statusCode === 408) return true;
  if (error instanceof Error && error.cause !== undefined) {
    return isTimeoutRelatedError(error.cause);
  }
  return false;
}

/**
 * Extracts the configured timeout duration (in ms) from an `APIError(408)`.
 *
 * Prefers structured `details.timeoutMs` metadata (set by `baseClient.toAPIError`),
 * falling back to regex on the error message for `APIError`s created elsewhere.
 *
 * @param error - An `APIError` with status 408
 * @returns The timeout duration in milliseconds, or `undefined`
 * @private
 */
function extractTimeoutMsFromAPIError(error: APIError): number | undefined {
  const details = error.details;
  if (typeof details === 'object' && details !== null && 'timeoutMs' in details) {
    const ms = (details as Record<string, unknown>)['timeoutMs'];
    if (typeof ms === 'number' && Number.isFinite(ms)) return ms;
  }
  const match = /timed out after (\d+)ms/.exec(error.message);
  if (match?.[1] !== undefined) return Number.parseInt(match[1], 10);
  return undefined;
}

/**
 * Extracts the configured timeout duration (in ms) from a timeout-related error,
 * if available. Returns `undefined` when the duration cannot be determined.
 *
 * Prefers structured `details.timeoutMs` metadata on `APIError(408)` (set by
 * `baseClient.toAPIError`), falling back to regex on the error message.
 * Recurses into `Error.cause` chains.
 *
 * @param error - A timeout-related error
 * @returns The timeout duration in milliseconds, or `undefined`
 */
export function extractTimeoutMs(error: unknown): number | undefined {
  if (error instanceof TimeoutError) return error.timeoutMs;
  if (error instanceof APIError && error.statusCode === 408) {
    return extractTimeoutMsFromAPIError(error);
  }
  if (error instanceof Error && error.cause !== undefined) {
    return extractTimeoutMs(error.cause);
  }
  return undefined;
}

/**
 * Extracts the nearest `toolName` from an error's cause chain.
 *
 * Walks the chain from the provided error toward its causes, returning the
 * first `ToolError` encountered (that is, the outermost `ToolError` in the
 * chain). Falls back to the provided `fallback` when no `ToolError` is found.
 *
 * @param error - Root error to inspect
 * @param fallback - Default tool name when no `ToolError` is in the chain
 * @returns The resolved tool name
 */
export function extractToolName(error: unknown, fallback: string): string {
  if (error instanceof ToolError) return error.toolName;
  if (error instanceof Error && error.cause !== undefined) {
    return extractToolName(error.cause, fallback);
  }
  return fallback;
}

/**
 * Builds a structured non-error timeout response.
 *
 * Instead of returning `isError: true` (which causes MCP clients to retry
 * the same slow request), this returns a well-formed success response with
 * explicit timeout indicators and OSINT-standard metadata so callers can
 * reliably distinguish a timeout from a normal successful analysis result.
 *
 * The payload preserves the legacy `data: []` and `'@context': []` fields for
 * compatibility, while also including standard OSINT output fields such as
 * `confidenceLevel`, `methodology`, `dataFreshness`, and `sourceAttribution`.
 *
 * @param toolName - Name of the tool that timed out
 * @param timeoutMs - Configured timeout duration (if known)
 * @returns MCP-compliant ToolResult **without** `isError` — clients treat this as a
 *          successful timeout outcome and will not retry automatically.
 */
export function buildTimeoutResponse(toolName: string, timeoutMs: number | undefined): ToolResult {
  const durationSegment = timeoutMs !== undefined
    ? ` after ${String(timeoutMs)}ms`
    : '';
  const timeoutWarning =
    `Request timed out${durationSegment} — consider narrowing query parameters`
    + ' (e.g., add a year filter, reduce limit, or use a shorter timeframe)';

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        data: [],
        '@context': [],
        toolName,
        dataAvailable: false,
        timedOut: true,
        status: 'timeout',
        confidenceLevel: 'LOW',
        methodology: [
          'Response generated by timeout handler after upstream request exceeded the configured execution window.',
          'No substantive analytical conclusions were produced because source retrieval did not complete in time.',
        ],
        dataFreshness: {
          status: 'unknown',
          lastCheckedAt: new Date().toISOString(),
          notes: 'Timeout prevented verification of source freshness.',
        },
        sourceAttribution: [],
        dataQualityWarnings: [timeoutWarning],
      }, null, 2)
    }]
  };
}

// Re-export classification utilities from the extracted module so existing
// imports (e.g. `import { classifyError } from './errorHandler.js'`) continue
// to work without breaking changes.
export { classifyError } from './errorClassifier.js';
export type { ErrorClassification } from './errorClassifier.js';

/**
 * Handle a caught tool error, returning a safe MCP error response.
 * Never exposes raw stack traces to MCP clients.
 *
 * **Timeout handling:** When the root cause is a request timeout (status 408
 * or `TimeoutError`), returns a structured non-error response with
 * `data: []` and a `dataQualityWarnings` array instead of `isError: true`.
 * This prevents MCP clients from retrying the same slow request.
 *
 * For non-timeout errors, the error is delegated to {@link buildErrorResponse}
 * which auto-classifies via `classifyError()` and includes structured error
 * classification metadata (errorCode, errorCategory, httpStatus) enabling
 * programmatic retry logic. If the error is a {@link ToolError}, its own
 * `toolName` is preserved. Retryability is determined by auto-classification
 * (inspecting the cause chain) but can still honor `ToolError.isRetryable`
 * in generic fallback cases when no more specific signal is available.
 *
 * @param error - Caught error value
 * @param toolName - Fallback tool name when error carries no tool identity
 * @returns MCP-compliant ToolResult with isError flag set (or structured timeout response)
 */
export function handleToolError(error: unknown, toolName: string): ToolResult {
  // Timeout errors → structured non-error response to prevent futile retries
  if (isTimeoutRelatedError(error)) {
    const resolvedToolName = extractToolName(error, toolName);
    return buildTimeoutResponse(resolvedToolName, extractTimeoutMs(error));
  }

  // Non-timeout errors → delegate to buildErrorResponse which auto-classifies
  const effectiveToolName = error instanceof ToolError ? error.toolName : toolName;
  const effectiveError = error instanceof Error ? error : new Error('Unknown error occurred');
  return buildErrorResponse(effectiveError, effectiveToolName);
}

/**
 * Build a structured data-unavailable response for tools that cannot
 * compute meaningful results due to missing upstream data.
 *
 * @param toolName - Name of the tool reporting unavailability
 * @param message - Human-readable explanation of why data is unavailable
 * @returns MCP-compliant ToolResult
 */
export function handleDataUnavailable(toolName: string, message: string): ToolResult {
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        dataAvailable: false,
        confidenceLevel: 'LOW',
        toolName,
        message
      }, null, 2)
    }]
  };
}
