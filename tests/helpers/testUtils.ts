/**
 * Test Utilities
 * 
 * Shared utilities for integration and E2E tests
 * 
 * ISMS Policy: SC-002 (Secure Testing)
 */

/**
 * Check if an error is caused by rate limiting or network issues
 */
function isRateLimitOrNetworkError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes('fetch failed')
    || msg.includes('timed out')
    || msg.includes('rate limit')
    || msg.includes('429')
    || msg.includes('503');
}

/**
 * Retry a function with exponential backoff.
 * Always throws on final failure (use `retryOrSkip` to skip on rate limit errors).
 * 
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries
 * @param baseDelay - Base delay in milliseconds
 * @returns Result from function
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i < maxRetries) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError ?? new Error('Retry failed');
}

/**
 * Retry, but skip test (log warning) on rate limit or network errors instead of failing.
 * Skips immediately on the FIRST rate-limit/timeout/network error; does not retry those.
 * 
 * @param fn - Function to retry
 * @param testName - Name of the test for logging
 * @param maxRetries - Maximum number of retries (only for non-rate-limit errors)
 * @param baseDelay - Base delay in milliseconds
 * @returns Result from function
 * @throws Only non-rate-limit errors
 */
export async function retryOrSkip<T>(
  fn: () => Promise<T>,
  testName: string,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T | undefined> {
  let lastError: Error | undefined;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Skip immediately on rate limit or network/timeout errors – do NOT retry.
      // Retrying these would exceed the test timeout because each attempt can take
      // up to EP_REQUEST_TIMEOUT_MS (default 10s, up to 60s in CI) before failing.
      if (isRateLimitOrNetworkError(error)) {
        console.warn(`[SKIP] ${testName}: rate limited or network error — ${lastError.message}`);
        return undefined;
      }

      if (i < maxRetries) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError ?? new Error('Retry failed');
}

/**
 * Measure execution time of a function
 * 
 * @param fn - Function to measure
 * @returns Tuple of [result, duration in milliseconds]
 */
export async function measureTime<T>(
  fn: () => Promise<T>
): Promise<[T, number]> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  return [result, duration];
}

/**
 * Parse MCP tool response text content
 * 
 * @param content - MCP response content array
 * @returns Parsed JSON data
 */
export function parseMCPResponse<T = unknown>(
  content: Array<{ type: string; text?: string }>
): T {
  const textContent = content.find(c => c.type === 'text');
  if (!textContent?.text) {
    throw new Error('No text content in MCP response');
  }
  
  return JSON.parse(textContent.text) as T;
}

/**
 * Parse paginated MCP response and extract data array
 * 
 * @param content - MCP response content array
 * @returns Data array from paginated response
 */
export function parsePaginatedMCPResponse<T = unknown>(
  content: Array<{ type: string; text?: string }>
): T[] {
  const response = parseMCPResponse<{ data: T[] }>(content);
  
  if (typeof response !== 'object' || response === null || !('data' in response)) {
    throw new Error('Invalid paginated response structure');
  }
  
  return response.data;
}

/**
 * Validate MCP response structure
 * 
 * @param response - MCP response to validate
 * @throws Error if response is invalid
 */
export function validateMCPResponse(
  response: unknown
): asserts response is { content: Array<{ type: string; text?: string }> } {
  if (typeof response !== 'object' || response === null) {
    throw new Error('Response is not an object');
  }
  
  if (!('content' in response)) {
    throw new Error('Response missing content field');
  }
  
  if (!Array.isArray(response.content)) {
    throw new Error('Response content is not an array');
  }
  
  if (response.content.length === 0) {
    throw new Error('Response content is empty');
  }
}
