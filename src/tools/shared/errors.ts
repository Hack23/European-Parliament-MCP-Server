/**
 * Structured error class for MCP tool error reporting.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege), AU-002 (Audit Logging)
 */

/**
 * Structured error class that all MCP tools use for consistent error reporting.
 * Ensures tool name, operation, and safe context are always included without
 * leaking internal implementation details to clients.
 */
export class ToolError extends Error {
  readonly toolName: string;
  readonly operation: string;
  readonly isRetryable: boolean;
  override readonly cause?: Error;

  constructor(options: {
    toolName: string;
    operation: string;
    message: string;
    isRetryable?: boolean;
    cause?: unknown;
  }) {
    super(`[${options.toolName}] ${options.operation}: ${options.message}`);
    this.name = 'ToolError';
    this.toolName = options.toolName;
    this.operation = options.operation;
    this.isRetryable = options.isRetryable ?? false;
    this.cause = options.cause instanceof Error ? options.cause : undefined;
  }
}
