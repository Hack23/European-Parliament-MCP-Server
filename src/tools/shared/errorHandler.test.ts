/**
 * Tests for shared error handler utilities
 */

import { describe, it, expect } from 'vitest';
import { handleToolError, handleDataUnavailable } from './errorHandler.js';
import { ToolError } from './errors.js';

describe('handleToolError', () => {
  it('should return isError: true for Error instances', () => {
    const result = handleToolError(new Error('fail'), 'test_tool');
    expect(result.isError).toBe(true);
  });

  it('should preserve Error message for Error instances', () => {
    const result = handleToolError(new Error('real message'), 'tool');
    const parsed = JSON.parse(result.content[0]?.text ?? '');
    expect(parsed.error).toBe('real message');
  });

  it('should return generic message for non-Error values', () => {
    const result = handleToolError(null, 'tool');
    const parsed = JSON.parse(result.content[0]?.text ?? '');
    expect(parsed.error).toBe('Unknown error occurred');
  });

  it('should include toolName in response', () => {
    const result = handleToolError(new Error('e'), 'my_tool');
    const parsed = JSON.parse(result.content[0]?.text ?? '');
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
    const parsed = JSON.parse(result.content[0]?.text ?? '');
    expect(parsed.toolName).toBe('specific_tool');
  });

  it('should return isError: true for ToolError', () => {
    const err = new ToolError({ toolName: 'tool', operation: 'op', message: 'failed' });
    const result = handleToolError(err, 'tool');
    expect(result.isError).toBe(true);
  });
});

describe('handleDataUnavailable', () => {
  it('should set dataAvailable to false', () => {
    const result = handleDataUnavailable('tool', 'no data');
    const parsed = JSON.parse(result.content[0]?.text ?? '');
    expect(parsed.dataAvailable).toBe(false);
  });

  it('should set confidenceLevel to LOW', () => {
    const result = handleDataUnavailable('tool', 'no data');
    const parsed = JSON.parse(result.content[0]?.text ?? '');
    expect(parsed.confidenceLevel).toBe('LOW');
  });

  it('should include toolName and message', () => {
    const result = handleDataUnavailable('my_tool', 'EP API limitation');
    const parsed = JSON.parse(result.content[0]?.text ?? '');
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
    expect(() => JSON.parse(result.content[0]?.text ?? '')).not.toThrow();
  });
});
