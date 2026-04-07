/**
 * Structured error class for MCP tool error reporting.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege), AU-002 (Audit Logging)
 */

/**
 * Machine-readable error codes for MCP tool error categorization.
 * Enables programmatic retry/skip/fallback logic by clients.
 */
export type ErrorCode =
  | 'UPSTREAM_404'
  | 'UPSTREAM_500'
  | 'UPSTREAM_503'
  | 'UPSTREAM_TIMEOUT'
  | 'RATE_LIMITED'
  | 'INVALID_PARAMS'
  | 'FEED_FALLBACK'
  | 'UNKNOWN_TOOL'
  | 'INTERNAL_ERROR';

/**
 * High-level error categories for client-side retry/skip decisions.
 */
export type ErrorCategory =
  | 'DATA_UNAVAILABLE'
  | 'SERVER_ERROR'
  | 'TIMEOUT'
  | 'RATE_LIMIT'
  | 'CLIENT_ERROR'
  | 'DATA_QUALITY'
  | 'INTERNAL';

/**
 * Structured error class that all MCP tools use for consistent error reporting.
 * Ensures tool name, operation, and safe context are always included without
 * leaking internal implementation details to clients.
 */
export class ToolError extends Error {
  readonly toolName: string;
  readonly operation: string;
  readonly isRetryable: boolean;
  readonly errorCode?: ErrorCode;
  readonly errorCategory?: ErrorCategory;
  readonly httpStatus?: number;
  override readonly cause?: Error;

  constructor(options: {
    toolName: string;
    operation: string;
    message: string;
    isRetryable?: boolean;
    cause?: unknown;
    errorCode?: ErrorCode;
    errorCategory?: ErrorCategory;
    httpStatus?: number;
  }) {
    super(`[${options.toolName}] ${options.operation}: ${options.message}`);
    this.name = 'ToolError';
    this.toolName = options.toolName;
    this.operation = options.operation;
    this.isRetryable = options.isRetryable ?? false;
    if (options.errorCode !== undefined) {
      this.errorCode = options.errorCode;
    }
    if (options.errorCategory !== undefined) {
      this.errorCategory = options.errorCategory;
    }
    if (options.httpStatus !== undefined) {
      this.httpStatus = options.httpStatus;
    }
    if (options.cause instanceof Error) {
      this.cause = options.cause;
    }
  }
}
