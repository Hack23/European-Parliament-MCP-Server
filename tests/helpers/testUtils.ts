/**
 * Test Utilities
 * 
 * Shared utilities for integration and E2E tests
 * 
 * ISMS Policy: SC-002 (Secure Testing)
 */

import { setTimeout as sleep } from 'timers/promises';

/**
 * Wait for a condition to be true
 * 
 * @param condition - Function that returns true when condition is met
 * @param timeout - Maximum time to wait in milliseconds
 * @param interval - Check interval in milliseconds
 * @throws Error if timeout is reached
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await sleep(interval);
  }
  
  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * Retry a function with exponential backoff
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
        await sleep(delay);
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
 * Create a rate-limited function executor
 * 
 * @param requestsPerWindow - Number of requests allowed per window
 * @param windowMs - Window duration in milliseconds
 * @returns Function that executes with rate limiting
 */
export function createRateLimitedExecutor(
  requestsPerWindow: number,
  windowMs: number
) {
  const requests: number[] = [];
  
  return async <T>(fn: () => Promise<T>): Promise<T> => {
    const now = Date.now();
    
    // Remove old requests outside window
    while (requests.length > 0 && requests[0]! < now - windowMs) {
      requests.shift();
    }
    
    // Wait if at limit
    if (requests.length >= requestsPerWindow) {
      const oldestRequest = requests[0]!;
      const waitTime = (oldestRequest + windowMs) - now;
      if (waitTime > 0) {
        await sleep(waitTime);
      }
    }
    
    // Record this request
    requests.push(Date.now());
    
    return fn();
  };
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

/**
 * Clean up test environment
 * 
 * @param cleanup - Cleanup function
 * @returns Cleanup handler that catches errors
 */
export function createCleanupHandler(cleanup: () => Promise<void>) {
  return async (): Promise<void> => {
    try {
      await cleanup();
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };
}
