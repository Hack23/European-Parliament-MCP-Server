/**
 * Shared response builder utilities for MCP tool handlers.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import type { ToolResult } from './types.js';

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
 * @param error - Error instance or message string
 * @param toolName - Name of the tool that produced the error
 * @returns MCP-compliant ToolResult with isError flag set
 */
export function buildErrorResponse(error: unknown, toolName: string): ToolResult {
  let message: string;
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else {
    message = 'Unknown error occurred';
  }
  return {
    content: [{ type: 'text', text: JSON.stringify({ error: message, toolName }, null, 2) }],
    isError: true
  };
}
