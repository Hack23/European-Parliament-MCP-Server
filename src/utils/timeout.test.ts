/**
 * Tests for timeout utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  TimeoutError,
  withTimeout,
  withRetry,
  isTimeoutError
} from './timeout.js';

describe('TimeoutError', () => {
  it('should create a timeout error with message', () => {
    const error = new TimeoutError('Operation timed out');
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(TimeoutError);
    expect(error.message).toBe('Operation timed out');
    expect(error.name).toBe('TimeoutError');
  });
  
  it('should include timeout duration', () => {
    const error = new TimeoutError('Timed out', 5000);
    
    expect(error.timeoutMs).toBe(5000);
  });
  
  it('should have stack trace', () => {
    const error = new TimeoutError('Test');
    
    expect(error.stack).toBeDefined();
  });
});

describe('withTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  
  it('should resolve if promise completes before timeout', async () => {
    const promise = Promise.resolve('success');
    
    const resultPromise = withTimeout(promise, 1000);
    await vi.advanceTimersByTimeAsync(500);
    
    await expect(resultPromise).resolves.toBe('success');
  });
  
  it('should reject with TimeoutError if promise exceeds timeout', async () => {
    const promise = new Promise((resolve) => {
      setTimeout(() => resolve('success'), 2000);
    });
    
    const resultPromise = withTimeout(promise, 1000);
    await vi.advanceTimersByTimeAsync(1001);
    
    await expect(resultPromise).rejects.toThrow(TimeoutError);
    await expect(resultPromise).rejects.toThrow('Operation timed out after 1000ms');
  });
  
  it('should use custom error message', async () => {
    const promise = new Promise((resolve) => {
      setTimeout(() => resolve('success'), 2000);
    });
    
    const resultPromise = withTimeout(
      promise,
      1000,
      'Custom timeout message'
    );
    await vi.advanceTimersByTimeAsync(1001);
    
    await expect(resultPromise).rejects.toThrow('Custom timeout message');
  });
  
  it('should include timeout duration in error', async () => {
    const promise = new Promise((resolve) => {
      setTimeout(() => resolve('success'), 2000);
    });
    
    const resultPromise = withTimeout(promise, 1500);
    await vi.advanceTimersByTimeAsync(1501);
    
    try {
      await resultPromise;
      expect.fail('Should have thrown TimeoutError');
    } catch (error) {
      expect(error).toBeInstanceOf(TimeoutError);
      if (error instanceof TimeoutError) {
        expect(error.timeoutMs).toBe(1500);
      }
    }
  });
  
  it('should propagate promise rejection', async () => {
    const promise = Promise.reject(new Error('Original error'));
    
    const resultPromise = withTimeout(promise, 1000);
    
    await expect(resultPromise).rejects.toThrow('Original error');
  });
});

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  
  it('should succeed on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    
    const result = await withRetry(fn, {
      maxRetries: 3,
      timeoutMs: 1000
    });
    
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });
  
  it('should retry on failure', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('Attempt 1 failed'))
      .mockRejectedValueOnce(new Error('Attempt 2 failed'))
      .mockResolvedValue('success');
    
    const resultPromise = withRetry(fn, {
      maxRetries: 3,
      timeoutMs: 1000,
      retryDelayMs: 100
    });
    
    // Advance timers for retries
    await vi.advanceTimersByTimeAsync(100); // First retry delay
    await vi.advanceTimersByTimeAsync(200); // Second retry delay (exponential)
    
    const result = await resultPromise;
    
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });
  
  it('should throw after max retries exhausted', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Always fails'));
    
    const resultPromise = withRetry(fn, {
      maxRetries: 2,
      timeoutMs: 1000,
      retryDelayMs: 100
    });
    
    // Advance timers for all retries
    await vi.advanceTimersByTimeAsync(100); // First retry
    await vi.advanceTimersByTimeAsync(200); // Second retry
    
    await expect(resultPromise).rejects.toThrow('Always fails');
    expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });
  
  it('should not retry TimeoutError', async () => {
    const fn = vi.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve('success'), 2000);
      });
    });
    
    const resultPromise = withRetry(fn, {
      maxRetries: 3,
      timeoutMs: 100,
      retryDelayMs: 50
    });
    
    // Advance past timeout
    await vi.advanceTimersByTimeAsync(101);
    
    await expect(resultPromise).rejects.toThrow(TimeoutError);
    expect(fn).toHaveBeenCalledTimes(1); // No retries on timeout
  });
  
  it('should respect shouldRetry predicate', async () => {
    const fn = vi.fn().mockRejectedValue({ statusCode: 400 });
    
    const resultPromise = withRetry(fn, {
      maxRetries: 3,
      timeoutMs: 1000,
      shouldRetry: (error) => {
        // Only retry 5xx errors
        return (error as { statusCode: number }).statusCode >= 500;
      }
    });
    
    await expect(resultPromise).rejects.toEqual({ statusCode: 400 });
    expect(fn).toHaveBeenCalledTimes(1); // No retries for 4xx
  });
  
  it('should use exponential backoff', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue('success');
    
    const resultPromise = withRetry(fn, {
      maxRetries: 2,
      timeoutMs: 1000,
      retryDelayMs: 100
    });
    
    // First retry: 100ms * 2^0 = 100ms
    await vi.advanceTimersByTimeAsync(100);
    expect(fn).toHaveBeenCalledTimes(2);
    
    // Second retry: 100ms * 2^1 = 200ms
    await vi.advanceTimersByTimeAsync(200);
    expect(fn).toHaveBeenCalledTimes(3);
    
    await expect(resultPromise).resolves.toBe('success');
  });
});

describe('isTimeoutError', () => {
  it('should return true for TimeoutError', () => {
    const error = new TimeoutError('Test');
    
    expect(isTimeoutError(error)).toBe(true);
  });
  
  it('should return false for regular Error', () => {
    const error = new Error('Test');
    
    expect(isTimeoutError(error)).toBe(false);
  });
  
  it('should return false for non-Error values', () => {
    expect(isTimeoutError('string')).toBe(false);
    expect(isTimeoutError(null)).toBe(false);
    expect(isTimeoutError(undefined)).toBe(false);
    expect(isTimeoutError({})).toBe(false);
  });
});
