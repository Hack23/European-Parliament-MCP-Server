/**
 * Tests for shared error handler utilities
 */

import { describe, it, expect } from 'vitest';
import { handleToolError, handleDataUnavailable, classifyError } from './errorHandler.js';
import { ToolError } from './errors.js';

describe('handleToolError', () => {
  it('should return isError: true for Error instances', () => {
    const result = handleToolError(new Error('fail'), 'test_tool');
    expect(result.isError).toBe(true);
  });

  it('should preserve Error message for Error instances', () => {
    const result = handleToolError(new Error('real message'), 'tool');
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.error).toBe('real message');
  });

  it('should return generic message for non-Error values', () => {
    const result = handleToolError(null, 'tool');
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.error).toBe('Unknown error occurred');
  });

  it('should include toolName in response', () => {
    const result = handleToolError(new Error('e'), 'my_tool');
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.toolName).toBe('my_tool');
  });

  it('should not expose stack traces', () => {
    const err = new Error('test');
    const result = handleToolError(err, 'tool');
    const text = result.content[0]?.text ?? '';
    expect(text).not.toContain('at ');
    expect(text).not.toContain('.test.ts');
  });

  it('should handle ToolError and use toolName from the error', () => {
    const err = new ToolError({ toolName: 'specific_tool', operation: 'op', message: 'failed' });
    const result = handleToolError(err, 'fallback_tool');
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.toolName).toBe('specific_tool');
  });

  it('should return isError: true for ToolError', () => {
    const err = new ToolError({ toolName: 'tool', operation: 'op', message: 'failed' });
    const result = handleToolError(err, 'tool');
    expect(result.isError).toBe(true);
  });

  it('should include formatted ToolError message in error field', () => {
    const err = new ToolError({ toolName: 'specific_tool', operation: 'fetchData', message: 'connection refused' });
    const result = handleToolError(err, 'fallback_tool');
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.error).toBe('[specific_tool] fetchData: connection refused');
  });

  it('should include retryable field for ToolError', () => {
    const retryableErr = new ToolError({ toolName: 'tool', operation: 'op', message: 'msg', isRetryable: true });
    const nonRetryableErr = new ToolError({ toolName: 'tool', operation: 'op', message: 'msg', isRetryable: false });
    const retryableResult = JSON.parse(handleToolError(retryableErr, 'tool').content[0]?.text ?? '') as Record<string, unknown>;
    const nonRetryableResult = JSON.parse(handleToolError(nonRetryableErr, 'tool').content[0]?.text ?? '') as Record<string, unknown>;
    expect(retryableResult.retryable).toBe(true);
    expect(nonRetryableResult.retryable).toBe(false);
  });

  it('should include errorCode and errorCategory in ToolError response', () => {
    const err = new ToolError({
      toolName: 'tool',
      operation: 'fetchData',
      message: 'not found',
      errorCode: 'UPSTREAM_404',
      errorCategory: 'DATA_UNAVAILABLE',
      httpStatus: 404,
    });
    const result = handleToolError(err, 'tool');
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.errorCode).toBe('UPSTREAM_404');
    expect(parsed.errorCategory).toBe('DATA_UNAVAILABLE');
    expect(parsed.httpStatus).toBe(404);
  });

  it('should auto-classify ToolError from cause APIError with statusCode', () => {
    const apiError = Object.assign(new Error('Not Found'), { statusCode: 404, name: 'APIError' });
    const err = new ToolError({
      toolName: 'tool',
      operation: 'fetchData',
      message: 'failed',
      isRetryable: false,
      cause: apiError,
    });
    const result = handleToolError(err, 'tool');
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.errorCode).toBe('UPSTREAM_404');
    expect(parsed.errorCategory).toBe('DATA_UNAVAILABLE');
    expect(parsed.httpStatus).toBe(404);
  });

  it('should include errorCode and errorCategory in plain Error response', () => {
    const apiError = Object.assign(new Error('Server Error'), { statusCode: 500, name: 'APIError' });
    const result = handleToolError(apiError, 'tool');
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.errorCode).toBe('UPSTREAM_500');
    expect(parsed.errorCategory).toBe('SERVER_ERROR');
    expect(parsed.httpStatus).toBe(500);
    expect(parsed.retryable).toBe(true);
  });

  it('should classify validateInput ToolError as INVALID_PARAMS', () => {
    const err = new ToolError({
      toolName: 'tool',
      operation: 'validateInput',
      message: 'bad params',
    });
    const result = handleToolError(err, 'tool');
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.errorCode).toBe('INVALID_PARAMS');
    expect(parsed.errorCategory).toBe('CLIENT_ERROR');
  });

  it('should use classification.retryable for ToolError (not error.isRetryable)', () => {
    // ToolError says isRetryable: false, but cause is 429 (rate limited → retryable)
    const apiError = Object.assign(new Error('Rate limited'), { statusCode: 429, name: 'APIError' });
    const err = new ToolError({
      toolName: 'tool',
      operation: 'fetchData',
      message: 'rate limited',
      isRetryable: false,
      cause: apiError,
    });
    const result = handleToolError(err, 'tool');
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.errorCode).toBe('RATE_LIMITED');
    expect(parsed.retryable).toBe(true);
  });
});

describe('classifyError', () => {
  it('should classify ToolError with explicit errorCode', () => {
    const err = new ToolError({
      toolName: 'tool',
      operation: 'op',
      message: 'msg',
      errorCode: 'FEED_FALLBACK',
      errorCategory: 'DATA_QUALITY',
      isRetryable: false,
    });
    const result = classifyError(err);
    expect(result.errorCode).toBe('FEED_FALLBACK');
    expect(result.errorCategory).toBe('DATA_QUALITY');
    expect(result.retryable).toBe(false);
  });

  it('should classify error with statusCode 404', () => {
    const err = Object.assign(new Error('Not Found'), { statusCode: 404 });
    const result = classifyError(err);
    expect(result.errorCode).toBe('UPSTREAM_404');
    expect(result.errorCategory).toBe('DATA_UNAVAILABLE');
    expect(result.httpStatus).toBe(404);
    expect(result.retryable).toBe(false);
  });

  it('should classify error with statusCode 429', () => {
    const err = Object.assign(new Error('Rate limited'), { statusCode: 429 });
    const result = classifyError(err);
    expect(result.errorCode).toBe('RATE_LIMITED');
    expect(result.errorCategory).toBe('RATE_LIMIT');
    expect(result.retryable).toBe(true);
  });

  it('should classify error with statusCode 500', () => {
    const err = Object.assign(new Error('Internal'), { statusCode: 500 });
    const result = classifyError(err);
    expect(result.errorCode).toBe('UPSTREAM_500');
    expect(result.errorCategory).toBe('SERVER_ERROR');
    expect(result.retryable).toBe(true);
  });

  it('should classify error with statusCode 503', () => {
    const err = Object.assign(new Error('Service Unavailable'), { statusCode: 503 });
    const result = classifyError(err);
    expect(result.errorCode).toBe('UPSTREAM_503');
    expect(result.errorCategory).toBe('SERVER_ERROR');
    expect(result.retryable).toBe(true);
  });

  it('should classify error with statusCode 408 as timeout', () => {
    const err = Object.assign(new Error('Timeout'), { statusCode: 408 });
    const result = classifyError(err);
    expect(result.errorCode).toBe('UPSTREAM_TIMEOUT');
    expect(result.errorCategory).toBe('TIMEOUT');
    expect(result.retryable).toBe(true);
  });

  it('should classify 4xx errors as CLIENT_ERROR', () => {
    const err = Object.assign(new Error('Bad Request'), { statusCode: 400 });
    const result = classifyError(err);
    expect(result.errorCode).toBe('INVALID_PARAMS');
    expect(result.errorCategory).toBe('CLIENT_ERROR');
    expect(result.retryable).toBe(false);
  });

  it('should classify error with "timed out" in message as TIMEOUT', () => {
    const err = new Error('EP API request timed out after 10000ms');
    const result = classifyError(err);
    expect(result.errorCode).toBe('UPSTREAM_TIMEOUT');
    expect(result.errorCategory).toBe('TIMEOUT');
    expect(result.retryable).toBe(true);
    expect(result.httpStatus).toBeUndefined();
  });

  it('should classify ToolError with "timed out" in message as TIMEOUT', () => {
    const err = new ToolError({
      toolName: 'tool',
      operation: 'fetchData',
      message: 'EP API request timed out',
      isRetryable: true,
    });
    const result = classifyError(err);
    expect(result.errorCode).toBe('UPSTREAM_TIMEOUT');
    expect(result.errorCategory).toBe('TIMEOUT');
    expect(result.httpStatus).toBeUndefined();
  });

  it('should classify ToolError with cause having statusCode', () => {
    const apiError = Object.assign(new Error('Not Found'), { statusCode: 404 });
    const err = new ToolError({
      toolName: 'tool',
      operation: 'fetchData',
      message: 'failed',
      cause: apiError,
    });
    const result = classifyError(err);
    expect(result.errorCode).toBe('UPSTREAM_404');
    expect(result.httpStatus).toBe(404);
  });

  it('should default to INTERNAL_ERROR for unknown errors', () => {
    const result = classifyError('string error');
    expect(result.errorCode).toBe('INTERNAL_ERROR');
    expect(result.errorCategory).toBe('INTERNAL');
    expect(result.retryable).toBe(false);
  });

  it('should default to INTERNAL_ERROR for generic ToolError', () => {
    const err = new ToolError({
      toolName: 'tool',
      operation: 'compute',
      message: 'some failure',
    });
    const result = classifyError(err);
    expect(result.errorCode).toBe('INTERNAL_ERROR');
    expect(result.errorCategory).toBe('INTERNAL');
  });

  it('should derive errorCategory from errorCode when category is not set', () => {
    const err = new ToolError({
      toolName: 'tool',
      operation: 'op',
      message: 'msg',
      errorCode: 'UPSTREAM_503',
      isRetryable: true,
    });
    const result = classifyError(err);
    expect(result.errorCategory).toBe('SERVER_ERROR');
  });
});

describe('handleDataUnavailable', () => {
  it('should set dataAvailable to false', () => {
    const result = handleDataUnavailable('tool', 'no data');
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.dataAvailable).toBe(false);
  });

  it('should set confidenceLevel to LOW', () => {
    const result = handleDataUnavailable('tool', 'no data');
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.confidenceLevel).toBe('LOW');
  });

  it('should include toolName and message', () => {
    const result = handleDataUnavailable('my_tool', 'EP API limitation');
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.toolName).toBe('my_tool');
    expect(parsed.message).toBe('EP API limitation');
  });

  it('should not set isError flag', () => {
    const result = handleDataUnavailable('tool', 'msg');
    expect(result.isError).toBeUndefined();
  });

  it('should pretty-print JSON (2-space indent)', () => {
    const result = handleDataUnavailable('tool', 'msg');
    const text = result.content[0]?.text ?? '';
    expect(text).toContain('\n');
    expect(text).toContain('  ');
  });

  it('should produce valid JSON content', () => {
    const result = handleDataUnavailable('tool', 'msg');
    expect(() => JSON.parse(result.content[0]?.text ?? '') as unknown).not.toThrow();
  });
});
