/**
 * Error classification utilities for MCP tool error responses.
 *
 * Extracted from `errorHandler.ts` so that both `errorHandler.ts` and
 * `responseBuilder.ts` can import classification logic without creating
 * a circular dependency.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { ToolError } from './errors.js';
import type { ErrorCode, ErrorCategory } from './errors.js';

/**
 * Structured error classification result for MCP responses.
 */
export interface ErrorClassification {
  errorCode: ErrorCode;
  errorCategory: ErrorCategory;
  httpStatus?: number;
  retryable: boolean;
}

/**
 * Extract an HTTP status code from an error via duck typing.
 * Works with both `APIError` (from `clients/ep/baseClient`) and any error
 * carrying a numeric `statusCode` property (avoids circular imports).
 * @internal
 */
function extractHttpStatus(error: unknown): number | undefined {
  if (
    error !== null &&
    error !== undefined &&
    typeof error === 'object' &&
    'statusCode' in error &&
    typeof (error as { statusCode?: unknown }).statusCode === 'number'
  ) {
    return (error as { statusCode: number }).statusCode;
  }
  return undefined;
}

/**
 * Classify an error into a structured error code, category, and retryability.
 *
 * Priority:
 * 1. If the error is a `ToolError` with explicit `errorCode` already set, use it.
 *    Retryability is derived from the error code's standard meaning (via
 *    {@link retryableForCode}) rather than `ToolError.isRetryable`, ensuring
 *    consistency even when callers set `errorCode` without a matching
 *    `isRetryable`. **Note:** `ToolError.isRetryable` is ignored when
 *    `errorCode` is present.
 * 2. Inspect the error and its cause chain for HTTP status codes (for example
 *    from `APIError`) and classify from the resolved status.
 * 3. If the error is a `ToolError` without an explicit `errorCode`, apply
 *    heuristic classification, including operation-based mappings
 *    (`validateInput` → `INVALID_PARAMS`) and message-based timeout detection.
 * 4. If the error is a `ZodError` (validation failure), classify as
 *    `INVALID_PARAMS` / `CLIENT_ERROR`.
 * 5. If the error is a plain `Error`, apply message-based timeout detection
 *    (`timed out` → `UPSTREAM_TIMEOUT`).
 * 6. Default to `INTERNAL_ERROR`.
 *
 * @param error - The caught error value
 * @returns Structured classification with code, category, httpStatus, and retryable flag
 */
export function classifyError(error: unknown): ErrorClassification {
  // 1. ToolError with explicit classification
  if (error instanceof ToolError && error.errorCode !== undefined) {
    const code = error.errorCode;
    return {
      errorCode: code,
      errorCategory: error.errorCategory ?? categoryForCode(code),
      ...(error.httpStatus !== undefined ? { httpStatus: error.httpStatus } : {}),
      retryable: retryableForCode(code),
    };
  }

  // 2. Extract HTTP status from error or its cause chain
  const httpStatus = resolveHttpStatus(error);
  if (httpStatus !== undefined) {
    return classifyHttpStatus(httpStatus);
  }

  // 3. ToolError operation-based and message-based heuristics
  if (error instanceof ToolError) {
    return classifyToolErrorHeuristic(error);
  }

  // 4–6. Plain Error heuristics (ZodError, timeout, default)
  return classifyPlainErrorHeuristic(error);
}

/**
 * Resolve HTTP status by walking the error's cause chain (duck-typed).
 * Stops after 10 levels or on a cycle to prevent infinite loops.
 * @internal
 */
function resolveHttpStatus(error: unknown): number | undefined {
  const maxDepth = 10;
  const visited = new Set<object>();

  let current: unknown = error;
  for (let depth = 0; depth < maxDepth && current != null; depth += 1) {
    const status = extractHttpStatus(current);
    if (status !== undefined) {
      return status;
    }

    if (typeof current !== 'object') {
      return undefined;
    }
    if (visited.has(current)) {
      return undefined;
    }
    visited.add(current);

    current =
      current instanceof Error ? current.cause : undefined;
  }

  return undefined;
}

/**
 * Classify a ToolError using operation name and message heuristics.
 * @internal
 */
function classifyToolErrorHeuristic(error: ToolError): ErrorClassification {
  if (error.operation === 'validateInput') {
    return { errorCode: 'INVALID_PARAMS', errorCategory: 'CLIENT_ERROR', retryable: false };
  }
  if (error.message.includes('timed out')) {
    return { errorCode: 'UPSTREAM_TIMEOUT', errorCategory: 'TIMEOUT', retryable: true };
  }
  return { errorCode: 'INTERNAL_ERROR', errorCategory: 'INTERNAL', retryable: error.isRetryable };
}

/**
 * Classify a plain Error (non-ToolError) using name and message heuristics.
 * Detects ZodError (validation) and timeout patterns before falling back to INTERNAL_ERROR.
 * @internal
 */
function classifyPlainErrorHeuristic(error: unknown): ErrorClassification {
  if (error instanceof Error && error.name === 'ZodError') {
    return { errorCode: 'INVALID_PARAMS', errorCategory: 'CLIENT_ERROR', retryable: false };
  }
  if (error instanceof Error && error.message.includes('timed out')) {
    return { errorCode: 'UPSTREAM_TIMEOUT', errorCategory: 'TIMEOUT', retryable: true };
  }
  return { errorCode: 'INTERNAL_ERROR', errorCategory: 'INTERNAL', retryable: false };
}

/**
 * Map an HTTP status code to a structured error classification.
 * @internal
 */
function classifyHttpStatus(status: number): ErrorClassification {
  if (status === 404) {
    return {
      errorCode: 'UPSTREAM_404',
      errorCategory: 'DATA_UNAVAILABLE',
      httpStatus: status,
      retryable: false,
    };
  }
  if (status === 429) {
    return {
      errorCode: 'RATE_LIMITED',
      errorCategory: 'RATE_LIMIT',
      httpStatus: status,
      retryable: true,
    };
  }
  if (status === 408) {
    return {
      errorCode: 'UPSTREAM_TIMEOUT',
      errorCategory: 'TIMEOUT',
      httpStatus: status,
      retryable: true,
    };
  }
  if (status === 503) {
    return {
      errorCode: 'UPSTREAM_503',
      errorCategory: 'SERVER_ERROR',
      httpStatus: status,
      retryable: true,
    };
  }
  if (status >= 500) {
    return {
      errorCode: 'UPSTREAM_500',
      errorCategory: 'SERVER_ERROR',
      httpStatus: status,
      retryable: true,
    };
  }
  if (status >= 400) {
    return {
      errorCode: 'INVALID_PARAMS',
      errorCategory: 'CLIENT_ERROR',
      httpStatus: status,
      retryable: false,
    };
  }
  return {
    errorCode: 'INTERNAL_ERROR',
    errorCategory: 'INTERNAL',
    httpStatus: status,
    retryable: false,
  };
}

/**
 * Derive default category from error code.
 * @internal
 */
function categoryForCode(code: ErrorCode): ErrorCategory {
  const map: Record<ErrorCode, ErrorCategory> = {
    UPSTREAM_404: 'DATA_UNAVAILABLE',
    UPSTREAM_500: 'SERVER_ERROR',
    UPSTREAM_503: 'SERVER_ERROR',
    UPSTREAM_TIMEOUT: 'TIMEOUT',
    RATE_LIMITED: 'RATE_LIMIT',
    INVALID_PARAMS: 'CLIENT_ERROR',
    FEED_FALLBACK: 'DATA_QUALITY',
    UNKNOWN_TOOL: 'CLIENT_ERROR',
    INTERNAL_ERROR: 'INTERNAL',
  };
  return map[code];
}

/**
 * Derive standard retryability from an error code.
 *
 * Ensures callers who set `errorCode` on a `ToolError` get consistent
 * retryable metadata without needing to also set `isRetryable`.
 * @internal
 */
function retryableForCode(code: ErrorCode): boolean {
  const map: Record<ErrorCode, boolean> = {
    UPSTREAM_404: false,
    UPSTREAM_500: true,
    UPSTREAM_503: true,
    UPSTREAM_TIMEOUT: true,
    RATE_LIMITED: true,
    INVALID_PARAMS: false,
    FEED_FALLBACK: false,
    UNKNOWN_TOOL: false,
    INTERNAL_ERROR: false,
  };
  return map[code];
}
