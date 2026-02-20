/**
 * Custom Error Types for European Parliament MCP Server
 *
 * Provides comprehensive error handling with structured error types for:
 * - Validation failures
 * - API errors
 * - Rate limiting
 * - GDPR compliance violations
 *
 * All errors include proper error codes, status codes, and optional details
 * for debugging while ensuring sensitive information is not leaked to clients.
 *
 * @see https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md
 * @see https://github.com/Hack23/European-Parliament-MCP-Server
 */
/**
 * Base error class for European Parliament MCP Server
 *
 * Provides structured error handling with error codes, HTTP status codes,
 * and optional details for debugging. All errors extend this base class.
 *
 * @example
 * ```typescript
 * throw new MCPServerError(
 *   'Configuration not found',
 *   'CONFIG_ERROR',
 *   500,
 *   { configFile: 'mcp.json' }
 * );
 * ```
 */
export class MCPServerError extends Error {
    code;
    statusCode;
    details;
    /**
     * Create a new MCP Server error
     *
     * @param message - Human-readable error message
     * @param code - Machine-readable error code (e.g., 'VALIDATION_ERROR')
     * @param statusCode - HTTP status code (default: 500)
     * @param details - Optional additional error details for debugging
     */
    constructor(message, code, statusCode = 500, details) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'MCPServerError';
        Error.captureStackTrace(this, this.constructor);
    }
}
/**
 * Validation error for input validation failures
 *
 * Thrown when user input fails validation (e.g., invalid country code,
 * out of range limit, malformed ID). Always returns HTTP 400 status.
 *
 * @example
 * ```typescript
 * if (!isValidCountryCode(country)) {
 *   throw new ValidationError(
 *     'Invalid country code',
 *     { country, expected: 'ISO 3166-1 alpha-2' }
 *   );
 * }
 * ```
 */
export class ValidationError extends MCPServerError {
    /**
     * Create a new validation error
     *
     * @param message - Description of validation failure
     * @param details - Optional details about what failed validation
     */
    constructor(message, details) {
        super(message, 'VALIDATION_ERROR', 400, details);
        this.name = 'ValidationError';
    }
}
/**
 * Rate limit error when API rate limit is exceeded
 *
 * Thrown when the client exceeds the configured rate limit.
 * Always returns HTTP 429 status and includes retry-after information.
 *
 * @example
 * ```typescript
 * if (requestCount > maxRequests) {
 *   throw new RateLimitError(
 *     'Rate limit exceeded',
 *     60 // retry after 60 seconds
 *   );
 * }
 * ```
 */
export class RateLimitError extends MCPServerError {
    retryAfter;
    /**
     * Create a new rate limit error
     *
     * @param message - Description of rate limit violation
     * @param retryAfter - Number of seconds to wait before retrying (optional)
     */
    constructor(message, retryAfter) {
        super(message, 'RATE_LIMIT_EXCEEDED', 429, { retryAfter });
        this.retryAfter = retryAfter;
        this.name = 'RateLimitError';
    }
}
/**
 * EP API error for European Parliament API failures
 *
 * Thrown when the European Parliament API returns an error or
 * when communication with the API fails. Preserves the original
 * status code from the upstream API.
 *
 * @example
 * ```typescript
 * const response = await fetch(epApiUrl);
 * if (!response.ok) {
 *   throw new EPAPIError(
 *     'Failed to fetch MEP data',
 *     response.status,
 *     { url: epApiUrl, status: response.statusText }
 *   );
 * }
 * ```
 */
export class EPAPIError extends MCPServerError {
    /**
     * Create a new EP API error
     *
     * @param message - Description of API failure
     * @param statusCode - HTTP status code from EP API
     * @param details - Optional details about the failure
     */
    constructor(message, statusCode, details) {
        super(message, 'EP_API_ERROR', statusCode, details);
        this.name = 'EPAPIError';
    }
}
/**
 * GDPR compliance error
 *
 * Thrown when an operation would violate GDPR requirements, such as:
 * - Accessing personal data without proper authorization
 * - Caching personal data beyond retention limits
 * - Missing required audit logging
 * - Data minimization violations
 *
 * Always returns HTTP 403 status to indicate forbidden operation.
 *
 * @example
 * ```typescript
 * if (cacheAge > maxPersonalDataCacheAge) {
 *   throw new GDPRComplianceError(
 *     'Personal data cache expired',
 *     { cacheAge, maxAge: maxPersonalDataCacheAge }
 *   );
 * }
 * ```
 */
export class GDPRComplianceError extends MCPServerError {
    /**
     * Create a new GDPR compliance error
     *
     * @param message - Description of GDPR violation
     * @param details - Optional details about the violation
     */
    constructor(message, details) {
        super(message, 'GDPR_COMPLIANCE_ERROR', 403, details);
        this.name = 'GDPRComplianceError';
    }
}
/**
 * Type guard for MCPServerError
 *
 * Checks if an unknown error is an instance of MCPServerError or one of
 * its subclasses. Useful for error handling and formatting.
 *
 * @param error - Unknown error to check
 * @returns true if error is an MCPServerError or subclass
 *
 * @example
 * ```typescript
 * try {
 *   await fetchMEPs();
 * } catch (error) {
 *   if (isMCPServerError(error)) {
 *     console.error(`Error ${error.code}: ${error.message}`);
 *   }
 * }
 * ```
 */
export function isMCPServerError(error) {
    return error instanceof MCPServerError;
}
/**
 * Error formatter for MCP responses
 *
 * Formats errors for safe transmission to MCP clients. Internal errors
 * are sanitized to prevent information leakage while preserving useful
 * debugging information for expected error types.
 *
 * @param error - Error to format
 * @returns Formatted error object safe for client transmission
 *
 * @example
 * ```typescript
 * try {
 *   const result = await processMEPRequest(args);
 *   return { content: [{ type: 'text', text: JSON.stringify(result) }] };
 * } catch (error) {
 *   const formatted = formatMCPError(error);
 *   return { content: [{ type: 'text', text: JSON.stringify(formatted) }] };
 * }
 * ```
 *
 * @security
 * - Sanitizes internal errors to prevent information leakage
 * - Preserves error codes and safe details for structured errors
 * - Logs full error details internally for debugging
 */
export function formatMCPError(error) {
    if (isMCPServerError(error)) {
        return {
            code: error.code,
            message: error.message,
            details: error.details
        };
    }
    // Don't expose internal errors to clients
    // Log the full error internally for debugging
    if (error instanceof Error) {
        console.error('Internal error:', error);
    }
    else {
        console.error('Unknown error:', error);
    }
    return {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
    };
}
//# sourceMappingURL=errors.js.map