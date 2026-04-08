/**
 * Tests for src/server/cliUtils.ts
 *
 * Covers: parseTimeoutValue, resolveEffectiveTimeout
 */

import { describe, it, expect, afterEach } from 'vitest';
import { parseTimeoutValue, resolveEffectiveTimeout, DEFAULT_REQUEST_TIMEOUT_MS } from './cliUtils.js';
import { DEFAULT_TIMEOUTS } from '../utils/timeout.js';

// ── parseTimeoutValue ──────────────────────────────────────────────

describe('parseTimeoutValue', () => {
  it('parses valid positive integer string', () => {
    expect(parseTimeoutValue('90000')).toBe(90000);
  });

  it('parses "1" as minimum valid value', () => {
    expect(parseTimeoutValue('1')).toBe(1);
  });

  it('returns undefined for undefined input', () => {
    expect(parseTimeoutValue(undefined)).toBeUndefined();
  });

  it('returns undefined for empty string', () => {
    expect(parseTimeoutValue('')).toBeUndefined();
  });

  it('returns undefined for whitespace-only string', () => {
    expect(parseTimeoutValue('   ')).toBeUndefined();
  });

  it('returns undefined for "0"', () => {
    expect(parseTimeoutValue('0')).toBeUndefined();
  });

  it('returns undefined for negative number string', () => {
    expect(parseTimeoutValue('-1')).toBeUndefined();
  });

  it('returns undefined for non-numeric string', () => {
    expect(parseTimeoutValue('abc')).toBeUndefined();
  });

  it('returns undefined for partially-numeric string "10s"', () => {
    expect(parseTimeoutValue('10s')).toBeUndefined();
  });

  it('returns undefined for partially-numeric string "1000ms"', () => {
    expect(parseTimeoutValue('1000ms')).toBeUndefined();
  });

  it('returns undefined for float string "10.5"', () => {
    expect(parseTimeoutValue('10.5')).toBeUndefined();
  });

  it('returns undefined for string with leading space and digits', () => {
    // trim() is applied, so " 90000" should work
    expect(parseTimeoutValue(' 90000 ')).toBe(90000);
  });

  it('returns undefined for hex-like string "0xFF"', () => {
    expect(parseTimeoutValue('0xFF')).toBeUndefined();
  });
});

// ── resolveEffectiveTimeout ────────────────────────────────────────

describe('resolveEffectiveTimeout', () => {
  const savedEnv = process.env['EP_REQUEST_TIMEOUT_MS'];

  afterEach(() => {
    if (savedEnv === undefined) {
      delete process.env['EP_REQUEST_TIMEOUT_MS'];
    } else {
      process.env['EP_REQUEST_TIMEOUT_MS'] = savedEnv;
    }
  });

  it('returns default when env var is not set', () => {
    delete process.env['EP_REQUEST_TIMEOUT_MS'];
    expect(resolveEffectiveTimeout()).toBe(DEFAULT_REQUEST_TIMEOUT_MS);
  });

  it('returns parsed value when env var is valid', () => {
    process.env['EP_REQUEST_TIMEOUT_MS'] = '60000';
    expect(resolveEffectiveTimeout()).toBe(60000);
  });

  it('returns default when env var is empty', () => {
    process.env['EP_REQUEST_TIMEOUT_MS'] = '';
    expect(resolveEffectiveTimeout()).toBe(DEFAULT_REQUEST_TIMEOUT_MS);
  });

  it('returns default when env var is invalid', () => {
    process.env['EP_REQUEST_TIMEOUT_MS'] = 'not-a-number';
    expect(resolveEffectiveTimeout()).toBe(DEFAULT_REQUEST_TIMEOUT_MS);
  });

  it('returns default when env var is partially numeric like "10s"', () => {
    process.env['EP_REQUEST_TIMEOUT_MS'] = '10s';
    expect(resolveEffectiveTimeout()).toBe(DEFAULT_REQUEST_TIMEOUT_MS);
  });

  it('returns default when env var is "0"', () => {
    process.env['EP_REQUEST_TIMEOUT_MS'] = '0';
    expect(resolveEffectiveTimeout()).toBe(DEFAULT_REQUEST_TIMEOUT_MS);
  });
});

// ── DEFAULT_REQUEST_TIMEOUT_MS ─────────────────────────────────────

describe('DEFAULT_REQUEST_TIMEOUT_MS', () => {
  it('derives from DEFAULT_TIMEOUTS.EP_API_REQUEST_MS (single source of truth)', () => {
    expect(DEFAULT_REQUEST_TIMEOUT_MS).toBe(DEFAULT_TIMEOUTS.EP_API_REQUEST_MS);
  });
});
