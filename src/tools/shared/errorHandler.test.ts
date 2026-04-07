/**
 * Tests for shared error handler utilities
 */

import { describe, it, expect } from 'vitest';
import { handleToolError, handleDataUnavailable, isTimeoutRelatedError, extractTimeoutMs, buildTimeoutResponse } from './errorHandler.js';
import { ToolError } from './errors.js';
import { APIError } from '../../clients/ep/baseClient.js';
import { TimeoutError } from '../../utils/timeout.js';

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

  // ── Timeout handling ────────────────────────────────────────────────────

  it('should return structured non-error response for ToolError wrapping APIError(408)', () => {
    const apiErr = new APIError('EP API request to /adopted-texts/feed timed out after 120000ms', 408, { timeoutMs: 120000 });
    const toolErr = new ToolError({
      toolName: 'get_adopted_texts_feed',
      operation: 'fetchData',
      message: 'Failed to retrieve adopted texts feed',
      isRetryable: true,
      cause: apiErr,
    });
    const result = handleToolError(toolErr, 'get_adopted_texts_feed');
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.data).toEqual([]);
    const warnings = parsed.dataQualityWarnings as string[];
    expect(Array.isArray(warnings)).toBe(true);
    expect(warnings[0]).toContain('timed out');
    expect(warnings[0]).toContain('120000ms');
    expect(parsed.toolName).toBe('get_adopted_texts_feed');
  });

  it('should return structured non-error response for direct TimeoutError', () => {
    const err = new TimeoutError('Operation timed out after 180000ms', 180000);
    const result = handleToolError(err, 'get_events_feed');
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.data).toEqual([]);
    const warnings = parsed.dataQualityWarnings as string[];
    expect(warnings[0]).toContain('180000ms');
    expect(parsed.toolName).toBe('get_events_feed');
  });

  it('should return structured non-error response for direct APIError(408)', () => {
    const err = new APIError('EP API request timed out after 10000ms', 408, { timeoutMs: 10000 });
    const result = handleToolError(err, 'get_meps');
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.data).toEqual([]);
    const warnings = parsed.dataQualityWarnings as string[];
    expect(warnings[0]).toContain('10000ms');
  });

  it('should include query narrowing guidance in timeout response', () => {
    const err = new TimeoutError('timed out', 5000);
    const result = handleToolError(err, 'tool');
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    const warnings = parsed.dataQualityWarnings as string[];
    expect(warnings[0]).toContain('narrowing query parameters');
  });

  it('should use ToolError.toolName over fallback for timeout responses', () => {
    const apiErr = new APIError('timed out after 10000ms', 408, { timeoutMs: 10000 });
    const toolErr = new ToolError({
      toolName: 'get_procedures_feed',
      operation: 'fetchData',
      message: 'Failed',
      isRetryable: true,
      cause: apiErr,
    });
    const result = handleToolError(toolErr, 'fallback_name');
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.toolName).toBe('get_procedures_feed');
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

// ── isTimeoutRelatedError ───────────────────────────────────────────────

describe('isTimeoutRelatedError', () => {
  it('should detect direct TimeoutError', () => {
    expect(isTimeoutRelatedError(new TimeoutError('timed out', 5000))).toBe(true);
  });

  it('should detect APIError with status 408', () => {
    expect(isTimeoutRelatedError(new APIError('timed out', 408))).toBe(true);
  });

  it('should detect ToolError wrapping APIError(408)', () => {
    const apiErr = new APIError('timed out after 10000ms', 408);
    const toolErr = new ToolError({ toolName: 't', operation: 'o', message: 'm', cause: apiErr });
    expect(isTimeoutRelatedError(toolErr)).toBe(true);
  });

  it('should detect ToolError wrapping TimeoutError', () => {
    const te = new TimeoutError('timed out', 5000);
    const toolErr = new ToolError({ toolName: 't', operation: 'o', message: 'm', cause: te });
    expect(isTimeoutRelatedError(toolErr)).toBe(true);
  });

  it('should return false for regular Error', () => {
    expect(isTimeoutRelatedError(new Error('something failed'))).toBe(false);
  });

  it('should return false for APIError with non-408 status', () => {
    expect(isTimeoutRelatedError(new APIError('not found', 404))).toBe(false);
    expect(isTimeoutRelatedError(new APIError('server error', 500))).toBe(false);
  });

  it('should return false for ToolError without timeout cause', () => {
    const toolErr = new ToolError({ toolName: 't', operation: 'o', message: 'm', cause: new Error('network') });
    expect(isTimeoutRelatedError(toolErr)).toBe(false);
  });

  it('should return false for non-Error values', () => {
    expect(isTimeoutRelatedError(null)).toBe(false);
    expect(isTimeoutRelatedError(undefined)).toBe(false);
    expect(isTimeoutRelatedError('timeout')).toBe(false);
  });

  it('should detect ToolError wrapping another ToolError that wraps APIError(408)', () => {
    const apiErr = new APIError('timed out after 10000ms', 408, { timeoutMs: 10000 });
    const innerToolErr = new ToolError({ toolName: 't', operation: 'o', message: 'inner', cause: apiErr });
    const outerToolErr = new ToolError({ toolName: 't', operation: 'o', message: 'outer', cause: innerToolErr });
    expect(isTimeoutRelatedError(outerToolErr)).toBe(true);
  });

  it('should detect deeply nested ToolError wrapping TimeoutError', () => {
    const te = new TimeoutError('timed out', 5000);
    const inner = new ToolError({ toolName: 't', operation: 'o', message: 'inner', cause: te });
    const outer = new ToolError({ toolName: 't', operation: 'o', message: 'outer', cause: inner });
    expect(isTimeoutRelatedError(outer)).toBe(true);
  });
});

// ── extractTimeoutMs ────────────────────────────────────────────────────

describe('extractTimeoutMs', () => {
  it('should extract from TimeoutError.timeoutMs', () => {
    expect(extractTimeoutMs(new TimeoutError('timed out', 120000))).toBe(120000);
  });

  it('should extract from APIError(408) details.timeoutMs', () => {
    expect(extractTimeoutMs(new APIError('timed out after 180000ms', 408, { timeoutMs: 180000 }))).toBe(180000);
  });

  it('should fall back to message regex when details.timeoutMs is absent', () => {
    expect(extractTimeoutMs(new APIError('timed out after 180000ms', 408))).toBe(180000);
  });

  it('should extract from ToolError wrapping APIError(408) with details', () => {
    const apiErr = new APIError('EP API request to /feed timed out after 10000ms', 408, { timeoutMs: 10000 });
    const toolErr = new ToolError({ toolName: 't', operation: 'o', message: 'm', cause: apiErr });
    expect(extractTimeoutMs(toolErr)).toBe(10000);
  });

  it('should extract from ToolError wrapping TimeoutError', () => {
    const te = new TimeoutError('timed out', 5000);
    const toolErr = new ToolError({ toolName: 't', operation: 'o', message: 'm', cause: te });
    expect(extractTimeoutMs(toolErr)).toBe(5000);
  });

  it('should extract from deeply nested ToolError chain', () => {
    const apiErr = new APIError('timed out after 10000ms', 408, { timeoutMs: 10000 });
    const inner = new ToolError({ toolName: 't', operation: 'o', message: 'inner', cause: apiErr });
    const outer = new ToolError({ toolName: 't', operation: 'o', message: 'outer', cause: inner });
    expect(extractTimeoutMs(outer)).toBe(10000);
  });

  it('should return undefined for non-timeout errors', () => {
    expect(extractTimeoutMs(new Error('fail'))).toBeUndefined();
    expect(extractTimeoutMs(null)).toBeUndefined();
  });

  it('should return undefined for APIError(408) without ms in message or details', () => {
    expect(extractTimeoutMs(new APIError('request timeout', 408))).toBeUndefined();
  });
});

// ── buildTimeoutResponse ────────────────────────────────────────────────

describe('buildTimeoutResponse', () => {
  it('should return MCP-compliant response without isError', () => {
    const result = buildTimeoutResponse('get_meps', 10000);
    expect(result.isError).toBeUndefined();
    expect(result.content).toHaveLength(1);
    expect(result.content[0]?.type).toBe('text');
  });

  it('should include empty data array', () => {
    const result = buildTimeoutResponse('tool', 5000);
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.data).toEqual([]);
  });

  it('should include dataQualityWarnings as string array', () => {
    const result = buildTimeoutResponse('tool', 5000);
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    const warnings = parsed.dataQualityWarnings as string[];
    expect(Array.isArray(warnings)).toBe(true);
    expect(warnings).toHaveLength(1);
    expect(typeof warnings[0]).toBe('string');
  });

  it('should include timeout duration in dataQualityWarnings', () => {
    const result = buildTimeoutResponse('tool', 120000);
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    const warnings = parsed.dataQualityWarnings as string[];
    expect(warnings[0]).toContain('120000ms');
  });

  it('should include query narrowing guidance', () => {
    const result = buildTimeoutResponse('tool', 5000);
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    const warnings = parsed.dataQualityWarnings as string[];
    expect(warnings[0]).toContain('narrowing query parameters');
    expect(warnings[0]).toContain('year filter');
  });

  it('should include toolName', () => {
    const result = buildTimeoutResponse('get_adopted_texts_feed', 5000);
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.toolName).toBe('get_adopted_texts_feed');
  });

  it('should handle undefined timeoutMs gracefully', () => {
    const result = buildTimeoutResponse('tool', undefined);
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    const warnings = parsed.dataQualityWarnings as string[];
    expect(warnings[0]).toContain('timed out');
    expect(parsed.data).toEqual([]);
  });

  it('should not include deprecated items or partial fields', () => {
    const result = buildTimeoutResponse('tool', 5000);
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed).not.toHaveProperty('items');
    expect(parsed).not.toHaveProperty('partial');
    expect(parsed).not.toHaveProperty('dataQualityWarning');
  });

  it('should produce valid JSON content', () => {
    const result = buildTimeoutResponse('tool', 5000);
    expect(() => JSON.parse(result.content[0]?.text ?? '') as unknown).not.toThrow();
  });
});
