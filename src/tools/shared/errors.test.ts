/**
 * Tests for ToolError class
 */

import { describe, it, expect } from 'vitest';
import { ToolError } from './errors.js';

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
});
