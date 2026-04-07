/**
 * Shared error handling utilities for MCP tool handlers.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import type { ToolResult } from './types.js';
import { buildErrorResponse } from './responseBuilder.js';
import { ToolError } from './errors.js';
import type { ErrorCode, ErrorCategory } from './errors.js';

/**
 * Structured error classification result for MCP responses.
 */
export interface ErrorClassification {
  errorCode: ErrorCode;
  errorCategory: ErrorCategory;
  httpStatus?: number | undefined;
  retryable: boolean;
}

/**
 * Extract an HTTP status code from an error's cause chain.
 * Works with both `APIError` (from `clients/ep/baseClient`) and any error
 * carrying a numeric `statusCode` property (duck typing avoids circular imports).
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
 * 2. Inspect the cause chain for HTTP status codes (from `APIError`).
 * 3. Fall back to operation-based heuristics (`validateInput` → `INVALID_PARAMS`).
 * 4. Default to `INTERNAL_ERROR`.
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
      httpStatus: error.httpStatus,
      retryable: error.isRetryable,
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

  // 4. Plain Error heuristics (timeout detection)
  if (error instanceof Error && error.message.includes('timed out')) {
    return { errorCode: 'UPSTREAM_TIMEOUT', errorCategory: 'TIMEOUT', retryable: true };
  }

  // 5. Default
  return { errorCode: 'INTERNAL_ERROR', errorCategory: 'INTERNAL', retryable: false };
}

/**
 * Resolve HTTP status from an error or its cause chain (duck-typed).
 * @internal
 */
function resolveHttpStatus(error: unknown): number | undefined {
  const directStatus = extractHttpStatus(error);
  const causeStatus =
    error instanceof Error ? extractHttpStatus(error.cause) : undefined;
  return directStatus ?? causeStatus;
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
 * Handle a caught tool error, returning a safe MCP error response.
 * Never exposes raw stack traces to MCP clients.
 *
 * If the error is a {@link ToolError}, its own `toolName` and `isRetryable` are
 * used so the originating tool and retryability are correctly surfaced to callers
 * even when the error crosses handler boundaries.
 *
 * All error responses now include structured error classification metadata
 * (errorCode, errorCategory, httpStatus) enabling programmatic retry logic.
 *
 * @param error - Caught error value
 * @param toolName - Fallback tool name when error carries no tool identity
 * @returns MCP-compliant ToolResult with isError flag set
 */
export function handleToolError(error: unknown, toolName: string): ToolResult {
  const classification = classifyError(error);

  if (error instanceof ToolError) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          error: error.message,
          toolName: error.toolName,
          retryable: error.isRetryable,
          errorCode: classification.errorCode,
          errorCategory: classification.errorCategory,
          ...(classification.httpStatus !== undefined && { httpStatus: classification.httpStatus }),
        }, null, 2)
      }],
      isError: true
    };
  }
  if (error instanceof Error) {
    return buildErrorResponse(error, toolName, classification);
  }
  return buildErrorResponse(new Error('Unknown error occurred'), toolName, classification);
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
