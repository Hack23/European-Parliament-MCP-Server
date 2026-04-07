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
 * Detects timeouts regardless of how deeply they are wrapped:
 * - Direct `TimeoutError`
 * - `APIError` with status 408 (produced by `baseClient.toAPIError`)
 * - `ToolError` whose `cause` is one of the above
 *
 * @param error - Caught error value
 * @returns `true` when the root cause is a timeout
 */
export function isTimeoutRelatedError(error: unknown): boolean {
  if (error instanceof TimeoutError) return true;
  if (error instanceof APIError && error.statusCode === 408) return true;
  if (error instanceof ToolError && error.cause !== undefined) {
    if (error.cause instanceof TimeoutError) return true;
    if (error.cause instanceof APIError && error.cause.statusCode === 408) return true;
  }
  return false;
}

/**
 * Extracts the configured timeout duration (in ms) from a timeout-related error,
 * if available. Returns `undefined` when the duration cannot be determined.
 *
 * @param error - A timeout-related error
 * @returns The timeout duration in milliseconds, or `undefined`
 */
export function extractTimeoutMs(error: unknown): number | undefined {
  if (error instanceof TimeoutError) return error.timeoutMs;
  if (error instanceof APIError && error.statusCode === 408) {
    const match = /timed out after (\d+)ms/.exec(error.message);
    if (match?.[1] !== undefined) return Number.parseInt(match[1], 10);
    return undefined;
  }
  if (error instanceof ToolError && error.cause !== undefined) {
    return extractTimeoutMs(error.cause);
  }
  return undefined;
}

/**
 * Builds a structured non-error timeout response.
 *
 * Instead of returning `isError: true` (which causes MCP clients to retry
 * the same slow request), this returns a well-formed success response with
 * an empty result set and a `dataQualityWarning` that guides the caller
 * toward narrowing the query.
 *
 * @param toolName - Name of the tool that timed out
 * @param timeoutMs - Configured timeout duration (if known)
 * @returns MCP-compliant ToolResult **without** `isError` — clients treat this as a
 *          successful (but empty) response and will not retry.
 */
export function buildTimeoutResponse(toolName: string, timeoutMs: number | undefined): ToolResult {
  const durationText = timeoutMs !== undefined
    ? `after ${String(timeoutMs)}ms`
    : '';
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        items: [],
        dataQualityWarning:
          `Request timed out ${durationText} — consider narrowing query parameters `
          + '(e.g., add a year filter, reduce limit, or use a shorter timeframe)',
        partial: false,
        toolName,
      }, null, 2)
    }]
  };
}

/**
 * Handle a caught tool error, returning a safe MCP error response.
 * Never exposes raw stack traces to MCP clients.
 *
 * **Timeout handling:** When the root cause is a request timeout (status 408
 * or `TimeoutError`), returns a structured non-error response with
 * `items: []` and a `dataQualityWarning` instead of `isError: true`.
 * This prevents MCP clients from retrying the same slow request.
 *
 * If the error is a {@link ToolError}, its own `toolName` and `isRetryable` are
 * used so the originating tool and retryability are correctly surfaced to callers
 * even when the error crosses handler boundaries.
 *
 * @param error - Caught error value
 * @param toolName - Fallback tool name when error carries no tool identity
 * @returns MCP-compliant ToolResult with isError flag set (or structured timeout response)
 */
export function handleToolError(error: unknown, toolName: string): ToolResult {
  // Timeout errors → structured non-error response to prevent futile retries
  if (isTimeoutRelatedError(error)) {
    const resolvedToolName = error instanceof ToolError ? error.toolName : toolName;
    return buildTimeoutResponse(resolvedToolName, extractTimeoutMs(error));
  }

  if (error instanceof ToolError) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ error: error.message, toolName: error.toolName, retryable: error.isRetryable }, null, 2)
      }],
      isError: true
    };
  }
  if (error instanceof Error) {
    return buildErrorResponse(error, toolName);
  }
  return buildErrorResponse(new Error('Unknown error occurred'), toolName);
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
