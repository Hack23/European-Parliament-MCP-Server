/**
 * Tests for shared response builder utilities
 */

import { describe, it, expect } from 'vitest';
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
    const parsed = JSON.parse(result.content[0]?.text ?? '');
    expect(parsed.error).toBe('something went wrong');
    expect(parsed.toolName).toBe('my_tool');
  });

  it('should handle string error input', () => {
    const result = buildErrorResponse('string error message', 'my_tool');
    const parsed = JSON.parse(result.content[0]?.text ?? '');
    expect(parsed.error).toBe('string error message');
  });

  it('should fall back to Unknown error for unknown types', () => {
    const result = buildErrorResponse(42, 'my_tool');
    const parsed = JSON.parse(result.content[0]?.text ?? '');
    expect(parsed.error).toBe('Unknown error occurred');
  });

  it('should include toolName in response', () => {
    const result = buildErrorResponse(new Error('e'), 'tool_name');
    const parsed = JSON.parse(result.content[0]?.text ?? '');
    expect(parsed.toolName).toBe('tool_name');
  });

  it('should produce valid JSON content', () => {
    const result = buildErrorResponse(new Error('test'), 'tool');
    expect(() => JSON.parse(result.content[0]?.text ?? '')).not.toThrow();
  });
});
