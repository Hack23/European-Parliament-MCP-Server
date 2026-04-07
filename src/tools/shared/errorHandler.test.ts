/**
 * Tests for shared error handler utilities
 */

import { describe, it, expect } from 'vitest';
import { handleToolError, handleDataUnavailable, classifyError, isTimeoutRelatedError, extractTimeoutMs, buildTimeoutResponse, extractToolName } from './errorHandler.js';
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
    expect(parsed['@context']).toEqual([]);
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

  it('should extract ToolError.toolName from nested cause chain for timeout responses', () => {
    const apiErr = new APIError('timed out after 10000ms', 408, { timeoutMs: 10000 });
    const toolErr = new ToolError({
      toolName: 'get_events_feed',
      operation: 'fetchData',
      message: 'Failed',
      isRetryable: true,
      cause: apiErr,
    });
    // Wrap the ToolError in a generic Error (simulating a non-ToolError wrapper)
    const wrapper = new Error('wrapper');
    (wrapper as { cause?: unknown }).cause = toolErr;
    const result = handleToolError(wrapper, 'fallback_name');
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.toolName).toBe('get_events_feed');
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

  it('should walk deeper cause chain to find statusCode', () => {
    const apiError = Object.assign(new Error('Service Unavailable'), { statusCode: 503 });
    const wrapper1 = new Error('inner wrapper');
    (wrapper1 as { cause?: unknown }).cause = apiError;
    const wrapper2 = new Error('outer wrapper');
    (wrapper2 as { cause?: unknown }).cause = wrapper1;
    const result = classifyError(wrapper2);
    expect(result.errorCode).toBe('UPSTREAM_503');
    expect(result.httpStatus).toBe(503);
    expect(result.retryable).toBe(true);
  });

  it('should handle circular cause chains without infinite loop', () => {
    const err1 = new Error('err1');
    const err2 = new Error('err2');
    (err1 as { cause?: unknown }).cause = err2;
    (err2 as { cause?: unknown }).cause = err1;
    const result = classifyError(err1);
    expect(result.errorCode).toBe('INTERNAL_ERROR');
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

  it('should derive retryable from errorCode (not error.isRetryable)', () => {
    // Caller sets errorCode: UPSTREAM_503 (retryable) but forgets isRetryable
    const err = new ToolError({
      toolName: 'tool',
      operation: 'op',
      message: 'service unavailable',
      errorCode: 'UPSTREAM_503',
      // isRetryable defaults to false, but UPSTREAM_503 is retryable
    });
    const result = classifyError(err);
    expect(result.retryable).toBe(true);
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

  it('should include @context for JSON-LD envelope consistency', () => {
    const result = buildTimeoutResponse('tool', 5000);
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed['@context']).toEqual([]);
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

  it('should handle undefined timeoutMs gracefully without double spaces', () => {
    const result = buildTimeoutResponse('tool', undefined);
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    const warnings = parsed.dataQualityWarnings as string[];
    expect(warnings[0]).toContain('timed out');
    expect(warnings[0]).not.toContain('timed out  ');
    expect(warnings[0]).not.toContain('out  —');
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

  it('should include dataAvailable: false indicator', () => {
    const result = buildTimeoutResponse('tool', 5000);
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.dataAvailable).toBe(false);
  });

  it('should include timedOut: true indicator', () => {
    const result = buildTimeoutResponse('tool', 5000);
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.timedOut).toBe(true);
  });

  it('should include status: timeout', () => {
    const result = buildTimeoutResponse('tool', 5000);
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.status).toBe('timeout');
  });

  it('should include OSINT confidenceLevel as LOW', () => {
    const result = buildTimeoutResponse('tool', 5000);
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.confidenceLevel).toBe('LOW');
  });

  it('should include OSINT methodology as descriptive array', () => {
    const result = buildTimeoutResponse('tool', 5000);
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    const methodology = parsed.methodology as string[];
    expect(Array.isArray(methodology)).toBe(true);
    expect(methodology.length).toBeGreaterThan(0);
    expect(methodology[0]).toContain('timeout handler');
  });

  it('should include OSINT dataFreshness with unknown status', () => {
    const result = buildTimeoutResponse('tool', 5000);
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    const freshness = parsed.dataFreshness as Record<string, unknown>;
    expect(freshness.status).toBe('unknown');
    expect(freshness.lastCheckedAt).toBeDefined();
    expect(freshness.notes).toContain('Timeout');
  });

  it('should include OSINT sourceAttribution as empty array', () => {
    const result = buildTimeoutResponse('tool', 5000);
    const parsed = JSON.parse(result.content[0]?.text ?? '') as Record<string, unknown>;
    expect(parsed.sourceAttribution).toEqual([]);
  });
});

// ── extractToolName ─────────────────────────────────────────────────────

describe('extractToolName', () => {
  it('should return ToolError.toolName for direct ToolError', () => {
    const err = new ToolError({ toolName: 'get_meps', operation: 'op', message: 'msg' });
    expect(extractToolName(err, 'fallback')).toBe('get_meps');
  });

  it('should return fallback for non-ToolError', () => {
    expect(extractToolName(new Error('fail'), 'fallback')).toBe('fallback');
  });

  it('should return fallback for non-Error values', () => {
    expect(extractToolName(null, 'fallback')).toBe('fallback');
    expect(extractToolName('string', 'fallback')).toBe('fallback');
  });

  it('should walk cause chain to find ToolError', () => {
    const apiErr = new APIError('timed out', 408);
    const toolErr = new ToolError({ toolName: 'get_events_feed', operation: 'op', message: 'msg', cause: apiErr });
    const wrapper = new Error('wrapper');
    (wrapper as { cause?: unknown }).cause = toolErr;
    expect(extractToolName(wrapper, 'fallback')).toBe('get_events_feed');
  });

  it('should find nearest ToolError in deeply nested chain', () => {
    const apiErr = new APIError('timed out', 408);
    const innerToolErr = new ToolError({ toolName: 'inner_tool', operation: 'op', message: 'inner', cause: apiErr });
    const outerToolErr = new ToolError({ toolName: 'outer_tool', operation: 'op', message: 'outer', cause: innerToolErr });
    expect(extractToolName(outerToolErr, 'fallback')).toBe('outer_tool');
  });
});
