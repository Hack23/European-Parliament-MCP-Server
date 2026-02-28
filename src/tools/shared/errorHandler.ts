/**
 * Shared error handling utilities for MCP tool handlers.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import type { ToolResult } from './types.js';
import { buildErrorResponse } from './responseBuilder.js';
import { ToolError } from './errors.js';

/**
 * Handle a caught tool error, returning a safe MCP error response.
 * Never exposes raw stack traces to MCP clients.
 *
 * If the error is a {@link ToolError}, its own `toolName` is used for the
 * response so the originating tool is correctly identified even when the
 * error crosses handler boundaries.
 *
 * @param error - Caught error value
 * @param toolName - Fallback tool name when error carries no tool identity
 * @returns MCP-compliant ToolResult with isError flag set
 */
export function handleToolError(error: unknown, toolName: string): ToolResult {
  if (error instanceof ToolError) {
    return buildErrorResponse(error, error.toolName);
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
