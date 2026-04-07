/**
 * Shared error handling utilities for MCP tool handlers.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import type { ToolResult } from './types.js';
import { buildErrorResponse } from './responseBuilder.js';
import { ToolError } from './errors.js';

// Re-export classification utilities from the extracted module so existing
// imports (e.g. `import { classifyError } from './errorHandler.js'`) continue
// to work without breaking changes.
export { classifyError } from './errorClassifier.js';
export type { ErrorClassification } from './errorClassifier.js';

/**
 * Handle a caught tool error, returning a safe MCP error response.
 * Never exposes raw stack traces to MCP clients.
 *
 * If the error is a {@link ToolError}, its own `toolName` is preserved so the
 * originating tool is correctly surfaced to callers. Retryability is
 * determined by the downstream error classification/response-building logic,
 * which primarily uses auto-classification (and may inspect the cause chain)
 * but can still honor `ToolError.isRetryable` in generic fallback cases when
 * no more specific classification signal is available.
 *
 * Error responses produced by this handler include structured error
 * classification metadata (errorCode, errorCategory, httpStatus) enabling
 * programmatic retry logic.
 *
 * @param error - Caught error value
 * @param toolName - Fallback tool name when error carries no tool identity
 * @returns MCP-compliant ToolResult with isError flag set
 */
export function handleToolError(error: unknown, toolName: string): ToolResult {
  // ToolError carries its own toolName — use it instead of the fallback
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
