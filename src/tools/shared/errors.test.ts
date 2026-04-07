/**
 * Tests for ToolError class
 */

import { describe, it, expect } from 'vitest';
import { ToolError } from './errors.js';
import type { ErrorCode, ErrorCategory } from './errors.js';

describe('ToolError', () => {
  it('should set name to ToolError', () => {
    const err = new ToolError({ toolName: 'test_tool', operation: 'testOp', message: 'test' });
    expect(err.name).toBe('ToolError');
  });

  it('should format message with toolName and operation prefix', () => {
    const err = new ToolError({ toolName: 'my_tool', operation: 'fetchData', message: 'connection refused' });
    expect(err.message).toBe('[my_tool] fetchData: connection refused');
  });

  it('should expose toolName and operation as properties', () => {
    const err = new ToolError({ toolName: 'tool', operation: 'op', message: 'msg' });
    expect(err.toolName).toBe('tool');
    expect(err.operation).toBe('op');
  });

  it('should default isRetryable to false', () => {
    const err = new ToolError({ toolName: 'tool', operation: 'op', message: 'msg' });
    expect(err.isRetryable).toBe(false);
  });

  it('should respect explicit isRetryable: true', () => {
    const err = new ToolError({ toolName: 'tool', operation: 'op', message: 'msg', isRetryable: true });
    expect(err.isRetryable).toBe(true);
  });

  it('should wrap cause when it is an Error', () => {
    const cause = new Error('original');
    const err = new ToolError({ toolName: 'tool', operation: 'op', message: 'msg', cause });
    expect(err.cause).toBe(cause);
  });

  it('should not expose non-Error cause', () => {
    const err = new ToolError({ toolName: 'tool', operation: 'op', message: 'msg', cause: 'string cause' });
    expect(err.cause).toBeUndefined();
  });

  it('should be instanceof Error', () => {
    const err = new ToolError({ toolName: 'tool', operation: 'op', message: 'msg' });
    expect(err).toBeInstanceOf(Error);
  });

  it('should be instanceof ToolError', () => {
    const err = new ToolError({ toolName: 'tool', operation: 'op', message: 'msg' });
    expect(err).toBeInstanceOf(ToolError);
  });

  it('should default errorCode, errorCategory, httpStatus to undefined', () => {
    const err = new ToolError({ toolName: 'tool', operation: 'op', message: 'msg' });
    expect(err.errorCode).toBeUndefined();
    expect(err.errorCategory).toBeUndefined();
    expect(err.httpStatus).toBeUndefined();
  });

  it('should accept errorCode and errorCategory', () => {
    const err = new ToolError({
      toolName: 'tool',
      operation: 'op',
      message: 'msg',
      errorCode: 'UPSTREAM_404',
      errorCategory: 'DATA_UNAVAILABLE',
    });
    expect(err.errorCode).toBe('UPSTREAM_404');
    expect(err.errorCategory).toBe('DATA_UNAVAILABLE');
  });

  it('should accept httpStatus', () => {
    const err = new ToolError({
      toolName: 'tool',
      operation: 'op',
      message: 'msg',
      errorCode: 'UPSTREAM_500',
      errorCategory: 'SERVER_ERROR',
      httpStatus: 500,
    });
    expect(err.httpStatus).toBe(500);
  });

  it('should accept all error code values', () => {
    const codes: ErrorCode[] = [
      'UPSTREAM_404', 'UPSTREAM_500', 'UPSTREAM_503', 'UPSTREAM_TIMEOUT',
      'RATE_LIMITED', 'INVALID_PARAMS', 'FEED_FALLBACK', 'UNKNOWN_TOOL', 'INTERNAL_ERROR',
    ];
    for (const code of codes) {
      const err = new ToolError({ toolName: 'tool', operation: 'op', message: 'msg', errorCode: code });
      expect(err.errorCode).toBe(code);
    }
  });

  it('should accept all error category values', () => {
    const categories: ErrorCategory[] = [
      'DATA_UNAVAILABLE', 'SERVER_ERROR', 'TIMEOUT', 'RATE_LIMIT',
      'CLIENT_ERROR', 'DATA_QUALITY', 'INTERNAL',
    ];
    for (const cat of categories) {
      const err = new ToolError({ toolName: 'tool', operation: 'op', message: 'msg', errorCategory: cat });
      expect(err.errorCategory).toBe(cat);
    }
  });
});
