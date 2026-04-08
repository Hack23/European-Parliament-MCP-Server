/**
 * Shared response builder utilities for MCP tool handlers.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import type { ToolResult } from './types.js';
import { classifyError } from './errorClassifier.js';
import type { ErrorClassification } from './errorClassifier.js';

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
 * When no explicit classification is provided, the error is automatically
 * classified via {@link classifyError} so all error responses — whether
 * routed through `handleToolError` or built directly by tool handlers —
 * include consistent `errorCode`, `errorCategory`, and `retryable` metadata.
 *
 * @param error - Error instance or message string
 * @param toolName - Name of the tool that produced the error
 * @param classification - Optional pre-computed classification (auto-classified if omitted)
 * @returns MCP-compliant ToolResult with isError flag set
 */
export function buildErrorResponse(
  error: unknown,
  toolName: string,
  classification?: ErrorClassification
): ToolResult {
  const cls = classification ?? classifyError(error);

  let message: string;
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else {
    message = 'Unknown error occurred';
  }

  const payload: Record<string, unknown> = {
    error: message,
    toolName,
    errorType: cls.errorCategory,
    retryable: cls.retryable,
    errorCode: cls.errorCode,
    errorCategory: cls.errorCategory,
  };
  if (cls.httpStatus !== undefined) {
    payload['httpStatus'] = cls.httpStatus;
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
    isError: true
  };
}
