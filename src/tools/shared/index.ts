/**
 * Shared utilities for MCP tool handlers.
 */

export type { ToolResult, ToolError } from './types.js';
export { buildToolResponse, buildErrorResponse } from './responseBuilder.js';
export { handleToolError, handleDataUnavailable } from './errorHandler.js';
