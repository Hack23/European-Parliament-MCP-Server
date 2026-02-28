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
    expect(SERVER_VERSION).toMatch(/^\d+\.\d+\.\d+/);
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
});
