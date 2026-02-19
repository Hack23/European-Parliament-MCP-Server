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
export class TimeoutError extends Error {
  /**
   * Create a new timeout error
   * 
   * @param message - Description of the timeout
   * @param timeoutMs - The timeout duration in milliseconds
   */
  constructor(
    message: string,
    public readonly timeoutMs?: number
  ) {
    super(message);
    this.name = 'TimeoutError';
    Error.captureStackTrace(this, this.constructor);
  }
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
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage?: string
): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  
  // Create timeout promise that rejects after specified time
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(
        new TimeoutError(
          errorMessage ?? `Operation timed out after ${String(timeoutMs)}ms`,
          timeoutMs
        )
      );
    }, timeoutMs);
  });
  
  // Race between the actual operation and timeout
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    // Always clear timeout to prevent memory leaks
    if (timeoutHandle !== undefined) {
      clearTimeout(timeoutHandle);
    }
  }
}

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
export async function withTimeoutAndAbort<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
  errorMessage?: string
): Promise<T> {
  const controller = new AbortController();
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  
  // Create timeout promise that rejects and aborts after specified time
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      controller.abort(); // Cancel the underlying operation
      reject(
        new TimeoutError(
          errorMessage ?? `Operation timed out after ${String(timeoutMs)}ms`,
          timeoutMs
        )
      );
    }, timeoutMs);
  });
  
  // Race between the actual operation and timeout
  try {
    const result = await Promise.race([fn(controller.signal), timeoutPromise]);
    return result;
  } finally {
    // Always clear timeout to prevent memory leaks
    if (timeoutHandle !== undefined) {
      clearTimeout(timeoutHandle);
    }
  }
}

/**
 * Validate withRetry options
 * 
 * @param maxRetries - Maximum retry count
 * @param timeoutMs - Timeout duration  
 * @param retryDelayMs - Retry delay duration
 * @throws {Error} If any option is invalid
 */
function validateRetryOptions(
  maxRetries: number,
  timeoutMs: number,
  retryDelayMs: number
): void {
  if (maxRetries < 0) {
    throw new Error('maxRetries must be non-negative');
  }
  if (timeoutMs <= 0) {
    throw new Error('timeoutMs must be positive');
  }
  if (retryDelayMs <= 0) {
    throw new Error('retryDelayMs must be positive');
  }
}

/**
 * Execute a function with retry logic and timeout
 * 
 * Retries the operation up to {@link options.maxRetries} times (for a total
 * of maxRetries + 1 attempts including the initial call). Each retry has its
 * own timeout.
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
 * @param options.timeoutMs - Per-attempt timeout in milliseconds
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
 * // Retry up to 3 times (4 total attempts) on 5xx errors only
 * const data = await withRetry(
 *   () => fetchFromAPI('/endpoint'),
 *   {
 *     maxRetries: 3,
 *     timeoutMs: 5000,
 *     retryDelayMs: 1000,
 *     shouldRetry: (error) => error.statusCode >= 500
 *   }
 * );
 * ```
 * 
 * @security
 * - Prevents retry storms with exponential backoff
 * - Respects timeout limits per attempt
 * - Configurable retry conditions for security
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries: number;
    timeoutMs: number;
    retryDelayMs?: number;
    timeoutErrorMessage?: string;
    shouldRetry?: (error: unknown) => boolean;
  }
): Promise<T> {
  const {
    maxRetries,
    timeoutMs,
    retryDelayMs = 1000,
    timeoutErrorMessage,
    shouldRetry = (): boolean => true
  } = options;
  
  // Input validation
  validateRetryOptions(maxRetries, timeoutMs, retryDelayMs);
  
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Add timeout to each attempt
      return await withTimeout(fn(), timeoutMs, timeoutErrorMessage);
    } catch (error) {
      lastError = error;
      
      // Don't retry timeout errors
      if (error instanceof TimeoutError) {
        throw error;
      }
      
      // Check if we should retry this error
      if (!shouldRetry(error)) {
        throw error;
      }
      
      // Don't wait after the last attempt
      if (attempt < maxRetries) {
        // Exponential backoff: delay * 2^attempt
        const delay = retryDelayMs * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All retries exhausted - this should always have a value since we attempt at least once
  throw lastError;
}

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
export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof TimeoutError;
}
