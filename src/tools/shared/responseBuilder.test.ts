/**
 * Tests for shared response builder utilities
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { buildToolResponse, buildErrorResponse } from './responseBuilder.js';

describe('buildToolResponse', () => {
  it('should wrap data as formatted JSON text content', () => {
    const data = { foo: 'bar', count: 42 };
    const result = buildToolResponse(data);

    expect(result.content).toHaveLength(1);
    expect(result.content[0]?.type).toBe('text');
    expect(result.content[0]?.text).toBe(JSON.stringify(data, null, 2));
    expect(result.isError).toBeUndefined();
  });

  it('should handle null data', () => {
    const result = buildToolResponse(null);
    expect(result.content[0]?.text).toBe('null');
  });

  it('should handle array data', () => {
    const data = [1, 2, 3];
    const result = buildToolResponse(data);
    expect(JSON.parse(result.content[0]?.text ?? '')).toEqual(data);
  });

  it('should handle empty object', () => {
    const result = buildToolResponse({});
    expect(result.content[0]?.text).toBe('{}');
  });

  it('should pretty-print with 2-space indentation', () => {
    const result = buildToolResponse({ a: 1 });
    expect(result.content[0]?.text).toContain('\n');
  });
});

describe('buildErrorResponse', () => {
  it('should return isError: true', () => {
    const result = buildErrorResponse(new Error('oops'), 'test_tool');
    expect(result.isError).toBe(true);
  });

  it('should extract message from Error instance', () => {
    const result = buildErrorResponse(new Error('something went wrong'), 'my_tool');
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.error).toBe('something went wrong');
    expect(parsed.toolName).toBe('my_tool');
    expect(parsed.errorType).toBe('INTERNAL');
  });

  it('should classify ZodError as errorType CLIENT_ERROR', () => {
    const schema = z.object({ name: z.string() });
    let zodError: Error | undefined;
    try {
      schema.parse({ name: 42 });
    } catch (e) {
      zodError = e as Error;
    }
    expect(zodError).toBeDefined();
    const result = buildErrorResponse(zodError!, 'zod_tool');
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.errorType).toBe('CLIENT_ERROR');
    expect(parsed.errorCode).toBe('INVALID_PARAMS');
    expect(parsed.toolName).toBe('zod_tool');
  });

  it('should handle string error input', () => {
    const result = buildErrorResponse('string error message', 'my_tool');
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.error).toBe('string error message');
    expect(parsed.errorType).toBe('INTERNAL');
  });

  it('should fall back to Unknown error for unknown types', () => {
    const result = buildErrorResponse(42, 'my_tool');
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.error).toBe('Unknown error occurred');
    expect(parsed.errorType).toBe('INTERNAL');
  });

  it('should include toolName in response', () => {
    const result = buildErrorResponse(new Error('e'), 'tool_name');
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.toolName).toBe('tool_name');
  });

  it('should produce valid JSON content', () => {
    const result = buildErrorResponse(new Error('test'), 'tool');
    expect(() => JSON.parse(result.content[0]?.text ?? '') as unknown).not.toThrow();
  });

  it('should pretty-print with 2-space indentation', () => {
    const result = buildErrorResponse(new Error('test'), 'tool');
    const text = result.content[0]?.text ?? '';
    expect(text).toContain('\n');
    expect(text).toContain('  ');
  });

  it('should include classification metadata when provided', () => {
    const classification = {
      errorCode: 'UPSTREAM_500',
      errorCategory: 'SERVER_ERROR',
      httpStatus: 500,
      retryable: true,
    };
    const result = buildErrorResponse(new Error('server error'), 'tool', classification);
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.errorCode).toBe('UPSTREAM_500');
    expect(parsed.errorCategory).toBe('SERVER_ERROR');
    expect(parsed.httpStatus).toBe(500);
    expect(parsed.retryable).toBe(true);
  });

  it('should omit httpStatus when not provided in classification', () => {
    const classification = {
      errorCode: 'INTERNAL_ERROR',
      errorCategory: 'INTERNAL',
      retryable: false,
    };
    const result = buildErrorResponse(new Error('unknown'), 'tool', classification);
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.errorCode).toBe('INTERNAL_ERROR');
    expect(parsed.httpStatus).toBeUndefined();
  });

  it('should auto-classify when no explicit classification is provided', () => {
    const result = buildErrorResponse(new Error('fail'), 'tool');
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.errorCode).toBe('INTERNAL_ERROR');
    expect(parsed.errorCategory).toBe('INTERNAL');
    expect(parsed.retryable).toBe(false);
  });

  it('should auto-classify upstream status when called directly', () => {
    const apiError = Object.assign(new Error('Service Unavailable'), { statusCode: 503 });
    const result = buildErrorResponse(apiError, 'tool');
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.errorCode).toBe('UPSTREAM_503');
    expect(parsed.errorCategory).toBe('SERVER_ERROR');
    expect(parsed.httpStatus).toBe(503);
    expect(parsed.retryable).toBe(true);
  });
});
