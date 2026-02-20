/**
 * Request Timeout Utilities
 *
 * ISMS Policy: SC-002 (Secure Coding), PE-001 (Performance Standards)
 *
 * Provides timeout handling for long-running operations to prevent
 * resource exhaustion and ensure responsive API behavior.
 *
 * @see https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md
 */
/**
 * Timeout error thrown when an operation exceeds its time limit
 *
 * @example
 * ```typescript
 * if (Date.now() - startTime > timeout) {
 *   throw new TimeoutError('Operation timed out after 10s');
 * }
 * ```
 */
export declare class TimeoutError extends Error {
    readonly timeoutMs?: number | undefined;
    /**
     * Create a new timeout error
     *
     * @param message - Description of the timeout
     * @param timeoutMs - The timeout duration in milliseconds
     */
    constructor(message: string, timeoutMs?: number | undefined);
}
/**
 * Execute a promise with a timeout
 *
 * Races the provided promise against a timeout. If the timeout expires
 * before the promise resolves, a TimeoutError is thrown.
 *
 * @template T - Type of the promise result
 * @param promise - Promise to execute with timeout
 * @param timeoutMs - Timeout in milliseconds
 * @param errorMessage - Optional custom error message
 * @returns Promise that resolves with the result or rejects with TimeoutError
 *
 * @throws {TimeoutError} If operation exceeds timeout
 *
 * @example
 * ```typescript
 * const result = await withTimeout(
 *   fetchFromAPI('/endpoint'),
 *   5000,
 *   'API request timed out'
 * );
 * ```
 *
 * @security
 * - Prevents resource exhaustion from hanging operations
 * - Ensures responsive API behavior
 * - Timeout values should be tuned per operation
 */
export declare function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage?: string): Promise<T>;
/**
 * Wraps a promise with a timeout and optional AbortSignal support.
 *
 * For operations that support cancellation (like fetch), pass a function that
 * accepts an AbortSignal. The signal will be aborted when the timeout fires,
 * allowing the underlying operation to clean up resources.
 *
 * @template T - Type of the promise result
 * @param fn - Function that returns a promise and optionally accepts an AbortSignal
 * @param timeoutMs - Timeout in milliseconds
 * @param errorMessage - Custom error message (optional)
 * @returns Promise that resolves/rejects with the operation result or timeout
 *
 * @example
 * ```typescript
 * // With AbortSignal support (for fetch, etc.)
 * await withTimeoutAndAbort(
 *   (signal) => fetch(url, { signal }),
 *   5000,
 *   'API request timed out'
 * );
 * ```
 */
export declare function withTimeoutAndAbort<T>(fn: (signal: AbortSignal) => Promise<T>, timeoutMs: number, errorMessage?: string): Promise<T>;
/**
 * Execute a function with retry logic and timeout
 *
 * Retries the operation up to {@link options.maxRetries} times (for a total
 * of maxRetries + 1 attempts including the initial call). Each retry has its
 * own timeout (if timeoutMs is provided).
 *
 * By default, all non-{@link TimeoutError} failures are considered retryable.
 * To restrict retries to transient failures only (for example, network
 * errors or 5xx status codes), provide a {@link options.shouldRetry}
 * predicate that returns true only for errors that should be retried.
 *
 * @template T - Type of the function result
 * @param fn - Async function to execute
 * @param options - Retry and timeout configuration
 * @param options.maxRetries - Maximum number of retry attempts after the initial call
 * @param options.timeoutMs - Optional per-attempt timeout in milliseconds (omit if fn handles timeout internally)
 * @param options.retryDelayMs - Base delay between retry attempts in milliseconds (default: 1000)
 * @param options.timeoutErrorMessage - Custom error message for timeout errors
 * @param options.shouldRetry - Predicate that decides if a failed attempt should be retried (default: retry all non-timeout errors)
 * @returns Promise that resolves with the result
 *
 * @throws {TimeoutError} If any attempt exceeds timeout
 * @throws {Error} If all retries are exhausted
 *
 * @example
 * ```typescript
 * // Retry up to 3 times (4 total attempts) on 5xx errors only with timeout
 * const data = await withRetry(
 *   () => fetchFromAPI('/endpoint'),
 *   {
 *     maxRetries: 3,
 *     timeoutMs: 5000,
 *     retryDelayMs: 1000,
 *     shouldRetry: (error) => error.statusCode >= 500
 *   }
 * );
 *
 * // Retry without additional timeout (fn handles timeout internally)
 * const data2 = await withRetry(
 *   () => withTimeoutAndAbort(signal => fetch(url, { signal }), 5000),
 *   {
 *     maxRetries: 3,
 *     retryDelayMs: 1000,
 *     shouldRetry: (error) => error.statusCode >= 500
 *   }
 * );
 * ```
 *
 * @security
 * - Prevents retry storms with exponential backoff
 * - Respects timeout limits per attempt (when provided)
 * - Configurable retry conditions for security
 */
export declare function withRetry<T>(fn: () => Promise<T>, options: {
    maxRetries: number;
    timeoutMs?: number;
    retryDelayMs?: number;
    timeoutErrorMessage?: string;
    shouldRetry?: (error: unknown) => boolean;
}): Promise<T>;
/**
 * Type guard to check if an error is a TimeoutError
 *
 * @param error - Error to check
 * @returns true if error is a TimeoutError
 *
 * @example
 * ```typescript
 * try {
 *   await withTimeout(operation(), 5000);
 * } catch (error) {
 *   if (isTimeoutError(error)) {
 *     console.error('Operation timed out:', error.timeoutMs);
 *   }
 * }
 * ```
 */
export declare function isTimeoutError(error: unknown): error is TimeoutError;
//# sourceMappingURL=timeout.d.ts.map