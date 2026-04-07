/**
 * Shared response builder utilities for MCP tool handlers.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import type { ToolResult } from './types.js';
import type { ErrorCode, ErrorCategory } from './errors.js';

/**
 * Optional structured error classification passed from the error handler.
 */
interface ErrorClassificationInfo {
  errorCode: ErrorCode;
  errorCategory: ErrorCategory;
  httpStatus?: number;
  retryable: boolean;
}

/**
 * Build a standard success response wrapping data as formatted JSON text.
 *
 * @param data - Data payload to serialize
 * @returns MCP-compliant ToolResult
 */
export function buildToolResponse(data: unknown): ToolResult {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
  };
}

/**
 * Build an error response from an error value or message string.
 * Never exposes raw stack traces to MCP clients.
 *
 * When classification metadata is provided (from {@link classifyError}),
 * the response includes `errorCode`, `errorCategory`, and optionally `httpStatus`
 * for programmatic retry/skip/fallback logic by clients.
 *
 * @param error - Error instance or message string
 * @param toolName - Name of the tool that produced the error
 * @param classification - Optional structured error classification
 * @returns MCP-compliant ToolResult with isError flag set
 */
export function buildErrorResponse(
  error: unknown,
  toolName: string,
  classification?: ErrorClassificationInfo
): ToolResult {
  let message: string;
  let errorType: 'Error' | 'ZodError' | 'string' | 'unknown';
  if (error instanceof Error) {
    message = error.message;
    errorType = error.name === 'ZodError' ? 'ZodError' : 'Error';
  } else if (typeof error === 'string') {
    message = error;
    errorType = 'string';
  } else {
    message = 'Unknown error occurred';
    errorType = 'unknown';
  }

  const payload: Record<string, unknown> = { error: message, toolName, errorType };
  if (classification !== undefined) {
    payload['retryable'] = classification.retryable;
    payload['errorCode'] = classification.errorCode;
    payload['errorCategory'] = classification.errorCategory;
    if (classification.httpStatus !== undefined) {
      payload['httpStatus'] = classification.httpStatus;
    }
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
    isError: true
  };
}
