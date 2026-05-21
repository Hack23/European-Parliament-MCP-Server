/**
 * Tests for src/config.ts
 *
 * Verifies that centralized configuration values are consistent and correctly
 * derived from package.json.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import {
  SERVER_NAME,
  SERVER_VERSION,
  USER_AGENT,
  DEFAULT_RATE_LIMIT_PER_MINUTE,
  DEFAULT_API_URL,
  DEFAULT_LIFECYCLE_WARMUP_INTERVAL_MS,
  LIFECYCLE_WARMUP_MIN_INTERVAL_MS,
  LIFECYCLE_WARMUP_MAX_INTERVAL_MS,
  resolveLifecycleWarmupIntervalMs,
} from './config.js';

describe('config', () => {
  it('SERVER_NAME is the canonical package name', () => {
    expect(SERVER_NAME).toBe('european-parliament-mcp-server');
  });

  it('SERVER_VERSION matches package.json version', () => {
    const pkg = JSON.parse(
      readFileSync(new URL('../package.json', import.meta.url), 'utf-8')
    ) as { version: string };
    expect(SERVER_VERSION).toBe(pkg.version);
  });

  it('SERVER_VERSION is a valid semver string', () => {
    // Full SemVer: MAJOR.MINOR.PATCH with optional pre-release and build metadata
    expect(SERVER_VERSION).toMatch(/^\d+\.\d+\.\d+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/);
  });

  it('USER_AGENT includes the actual SERVER_VERSION', () => {
    expect(USER_AGENT).toContain(SERVER_VERSION);
  });

  it('USER_AGENT starts with the server identifier', () => {
    expect(USER_AGENT).toMatch(/^European-Parliament-MCP-Server\//);
  });

  it('DEFAULT_RATE_LIMIT_PER_MINUTE is 100', () => {
    expect(DEFAULT_RATE_LIMIT_PER_MINUTE).toBe(100);
  });

  it('DEFAULT_API_URL points to the EP Open Data Portal v2', () => {
    expect(DEFAULT_API_URL).toBe('https://data.europarl.europa.eu/api/v2/');
  });

  describe('resolveLifecycleWarmupIntervalMs', () => {
    it('returns the default when the env variable is unset', () => {
      expect(resolveLifecycleWarmupIntervalMs({})).toBe(DEFAULT_LIFECYCLE_WARMUP_INTERVAL_MS);
    });

    it('returns the default for empty / whitespace-only values', () => {
      expect(resolveLifecycleWarmupIntervalMs({ EP_LIFECYCLE_WARMUP_INTERVAL_MS: '' })).toBe(
        DEFAULT_LIFECYCLE_WARMUP_INTERVAL_MS,
      );
      expect(resolveLifecycleWarmupIntervalMs({ EP_LIFECYCLE_WARMUP_INTERVAL_MS: '   ' })).toBe(
        DEFAULT_LIFECYCLE_WARMUP_INTERVAL_MS,
      );
    });

    it('returns the default for non-numeric values', () => {
      expect(
        resolveLifecycleWarmupIntervalMs({ EP_LIFECYCLE_WARMUP_INTERVAL_MS: 'not-a-number' }),
      ).toBe(DEFAULT_LIFECYCLE_WARMUP_INTERVAL_MS);
    });

    it('returns the default for non-positive numbers', () => {
      expect(resolveLifecycleWarmupIntervalMs({ EP_LIFECYCLE_WARMUP_INTERVAL_MS: '-1' })).toBe(
        DEFAULT_LIFECYCLE_WARMUP_INTERVAL_MS,
      );
      expect(resolveLifecycleWarmupIntervalMs({ EP_LIFECYCLE_WARMUP_INTERVAL_MS: '0' })).toBe(
        DEFAULT_LIFECYCLE_WARMUP_INTERVAL_MS,
      );
    });

    it('clamps values below the minimum to LIFECYCLE_WARMUP_MIN_INTERVAL_MS', () => {
      expect(resolveLifecycleWarmupIntervalMs({ EP_LIFECYCLE_WARMUP_INTERVAL_MS: '1000' })).toBe(
        LIFECYCLE_WARMUP_MIN_INTERVAL_MS,
      );
    });

    it('clamps values above the maximum to LIFECYCLE_WARMUP_MAX_INTERVAL_MS', () => {
      expect(
        resolveLifecycleWarmupIntervalMs({
          EP_LIFECYCLE_WARMUP_INTERVAL_MS: String(LIFECYCLE_WARMUP_MAX_INTERVAL_MS + 1),
        }),
      ).toBe(LIFECYCLE_WARMUP_MAX_INTERVAL_MS);
    });

    it('passes through valid values inside the clamp window', () => {
      expect(
        resolveLifecycleWarmupIntervalMs({ EP_LIFECYCLE_WARMUP_INTERVAL_MS: '120000' }),
      ).toBe(120_000);
    });

    it('default value is inside the clamp window', () => {
      expect(DEFAULT_LIFECYCLE_WARMUP_INTERVAL_MS).toBeGreaterThanOrEqual(
        LIFECYCLE_WARMUP_MIN_INTERVAL_MS,
      );
      expect(DEFAULT_LIFECYCLE_WARMUP_INTERVAL_MS).toBeLessThanOrEqual(
        LIFECYCLE_WARMUP_MAX_INTERVAL_MS,
      );
    });
  });
});
