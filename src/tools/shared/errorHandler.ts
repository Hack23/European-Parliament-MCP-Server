/**
 * Shared error handling utilities for MCP tool handlers.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import type { ToolResult } from './types.js';
import { buildErrorResponse } from './responseBuilder.js';

/**
 * Handle a caught tool error, returning a safe MCP error response.
 * Never exposes raw stack traces to MCP clients.
 *
 * @param error - Caught error value
 * @param toolName - Name of the tool that produced the error
 * @returns MCP-compliant ToolResult with isError flag set
 */
export function handleToolError(error: unknown, toolName: string): ToolResult {
  if (error instanceof Error) {
    return buildErrorResponse(error.message, toolName);
  }
  return buildErrorResponse('Unknown error occurred', toolName);
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
        confidence: 'LOW',
        toolName,
        message
      })
    }]
  };
}
