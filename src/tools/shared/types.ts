/**
 * Shared types for MCP tool responses.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

/**
 * Standard MCP tool response type
 */
export interface ToolResult {
  content: { type: 'text'; text: string }[];
  isError?: boolean;
}

/**
 * Structured error payload for tool error responses
 */
export interface ToolError {
  error: string;
  toolName: string;
  dataAvailable?: boolean;
  confidenceLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  message?: string;
}
