/**
 * Tests for src/server/cli.ts
 *
 * Covers: sanitizeUrl, showHelp, showVersion, showHealth, parseCLIArgs
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  sanitizeUrl,
  showHelp,
  showVersion,
  showHealth,
  parseCLIArgs,
} from './cli.js';
import { SERVER_NAME, SERVER_VERSION } from '../index.js';

// ── sanitizeUrl ────────────────────────────────────────────────────

describe('sanitizeUrl', () => {
  it('returns URL without credentials', () => {
    const result = sanitizeUrl('https://user:pass@example.com/api');
    expect(result).not.toContain('user');
    expect(result).not.toContain('pass');
    expect(result).toContain('example.com/api');
  });

  it('strips query parameters from valid URL', () => {
    const result = sanitizeUrl('https://example.com/api?token=secret&key=value');
    expect(result).not.toContain('token');
    expect(result).not.toContain('secret');
    expect(result).not.toContain('key');
    expect(result).toBe('https://example.com/api');
  });

  it('strips fragment from valid URL', () => {
    const result = sanitizeUrl('https://example.com/api#secret-anchor');
    expect(result).not.toContain('secret-anchor');
    expect(result).toBe('https://example.com/api');
  });

  it('strips both query and fragment from valid URL', () => {
    const result = sanitizeUrl('https://example.com/path?key=val#frag');
    expect(result).not.toContain('key');
    expect(result).not.toContain('frag');
    expect(result).toBe('https://example.com/path');
  });

  it('preserves clean URL unchanged', () => {
    const url = 'https://data.europarl.europa.eu/api/v2/';
    expect(sanitizeUrl(url)).toBe(url);
  });

  it('preserves path components in clean URL', () => {
    const url = 'https://example.com/path/to/resource';
    expect(sanitizeUrl(url)).toBe(url);
  });

  it('handles malformed URL by stripping query via string split', () => {
    const result = sanitizeUrl('not-a-valid-url?token=secret');
    expect(result).not.toContain('token');
    expect(result).toBe('not-a-valid-url');
  });

  it('handles malformed URL with fragment only', () => {
    const result = sanitizeUrl('not-valid#secret');
    expect(result).toBe('not-valid');
  });

  it('handles malformed URL with both query and fragment', () => {
    const result = sanitizeUrl('relative/path?q=1#frag');
    expect(result).toBe('relative/path');
  });

  it('handles empty string without throwing', () => {
    expect(sanitizeUrl('')).toBe('');
  });

  it('handles URL with only username (no password)', () => {
    const result = sanitizeUrl('https://user@example.com/path');
    expect(result).not.toContain('user');
    expect(result).toContain('example.com/path');
  });

  it('handles URL with port number', () => {
    const result = sanitizeUrl('https://example.com:8080/api');
    expect(result).toBe('https://example.com:8080/api');
  });
});

// ── showHelp ───────────────────────────────────────────────────────

describe('showHelp', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('calls console.log exactly once', () => {
    showHelp();
    expect(consoleSpy).toHaveBeenCalledTimes(1);
  });

  it('output contains server name', () => {
    showHelp();
    const output = String(consoleSpy.mock.calls[0]?.[0]);
    expect(output).toContain(SERVER_NAME);
  });

  it('output contains server version', () => {
    showHelp();
    const output = String(consoleSpy.mock.calls[0]?.[0]);
    expect(output).toContain(SERVER_VERSION);
  });

  it('output contains tool count', () => {
    showHelp();
    const output = String(consoleSpy.mock.calls[0]?.[0]);
    // Should contain "45" (total tool count)
    expect(output).toContain('45');
  });

  it('output contains core tool count of 7', () => {
    showHelp();
    const output = String(consoleSpy.mock.calls[0]?.[0]);
    expect(output).toContain('7');
  });

  it('output contains USAGE section', () => {
    showHelp();
    const output = String(consoleSpy.mock.calls[0]?.[0]);
    expect(output).toContain('USAGE');
  });

  it('output contains OPTIONS section', () => {
    showHelp();
    const output = String(consoleSpy.mock.calls[0]?.[0]);
    expect(output).toContain('OPTIONS');
  });

  it('output contains --help flag documentation', () => {
    showHelp();
    const output = String(consoleSpy.mock.calls[0]?.[0]);
    expect(output).toContain('--help');
  });

  it('output contains --version flag documentation', () => {
    showHelp();
    const output = String(consoleSpy.mock.calls[0]?.[0]);
    expect(output).toContain('--version');
  });

  it('output contains --health flag documentation', () => {
    showHelp();
    const output = String(consoleSpy.mock.calls[0]?.[0]);
    expect(output).toContain('--health');
  });

  it('output mentions MCP protocol', () => {
    showHelp();
    const output = String(consoleSpy.mock.calls[0]?.[0]);
    expect(output).toContain('MCP');
  });

  it('output contains European Parliament reference', () => {
    showHelp();
    const output = String(consoleSpy.mock.calls[0]?.[0]);
    expect(output.toLowerCase()).toContain('european parliament');
  });

  it('output contains GitHub URL', () => {
    showHelp();
    const output = String(consoleSpy.mock.calls[0]?.[0]);
    expect(output).toContain('github.com');
  });
});

// ── showVersion ────────────────────────────────────────────────────

describe('showVersion', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('calls console.log exactly once', () => {
    showVersion();
    expect(consoleSpy).toHaveBeenCalledTimes(1);
  });

  it('output contains SERVER_VERSION', () => {
    showVersion();
    const output = String(consoleSpy.mock.calls[0]?.[0]);
    expect(output).toContain(SERVER_VERSION);
  });

  it('output contains SERVER_NAME', () => {
    showVersion();
    const output = String(consoleSpy.mock.calls[0]?.[0]);
    expect(output).toContain(SERVER_NAME);
  });

  it('output contains semver version pattern', () => {
    showVersion();
    const output = String(consoleSpy.mock.calls[0]?.[0]);
    expect(output).toMatch(/\d+\.\d+\.\d+/);
  });
});

// ── showHealth ─────────────────────────────────────────────────────

describe('showHealth', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('calls console.log exactly once', () => {
    showHealth();
    expect(consoleSpy).toHaveBeenCalledTimes(1);
  });

  it('output is valid JSON', () => {
    showHealth();
    const output = String(consoleSpy.mock.calls[0]?.[0]);
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('health JSON contains name field', () => {
    showHealth();
    const health = JSON.parse(String(consoleSpy.mock.calls[0]?.[0])) as Record<string, unknown>;
    expect(health).toHaveProperty('name');
    expect(health['name']).toBe(SERVER_NAME);
  });

  it('health JSON contains version field', () => {
    showHealth();
    const health = JSON.parse(String(consoleSpy.mock.calls[0]?.[0])) as Record<string, unknown>;
    expect(health).toHaveProperty('version');
    expect(health['version']).toBe(SERVER_VERSION);
  });

  it('health JSON contains status field', () => {
    showHealth();
    const health = JSON.parse(String(consoleSpy.mock.calls[0]?.[0])) as Record<string, unknown>;
    expect(health).toHaveProperty('status');
    expect(['healthy', 'degraded', 'unhealthy']).toContain(health['status']);
  });

  it('health JSON contains capabilities array', () => {
    showHealth();
    const health = JSON.parse(String(consoleSpy.mock.calls[0]?.[0])) as Record<string, unknown>;
    expect(health).toHaveProperty('capabilities');
    expect(Array.isArray(health['capabilities'])).toBe(true);
    const caps = health['capabilities'] as string[];
    expect(caps).toContain('tools');
    expect(caps).toContain('resources');
    expect(caps).toContain('prompts');
  });

  it('health JSON contains tools object with total, core, advanced', () => {
    showHealth();
    const health = JSON.parse(String(consoleSpy.mock.calls[0]?.[0])) as Record<string, unknown>;
    expect(health).toHaveProperty('tools');
    const tools = health['tools'] as Record<string, unknown>;
    expect(tools).toHaveProperty('total');
    expect(tools).toHaveProperty('core');
    expect(tools).toHaveProperty('advanced');
    expect(tools['total']).toBe(45);
    expect(tools['core']).toBe(7);
    expect(tools['advanced']).toBe(38);
  });

  it('health JSON contains prompts object', () => {
    showHealth();
    const health = JSON.parse(String(consoleSpy.mock.calls[0]?.[0])) as Record<string, unknown>;
    expect(health).toHaveProperty('prompts');
    const prompts = health['prompts'] as Record<string, unknown>;
    expect(prompts).toHaveProperty('total');
  });

  it('health JSON contains resources object with templates', () => {
    showHealth();
    const health = JSON.parse(String(consoleSpy.mock.calls[0]?.[0])) as Record<string, unknown>;
    expect(health).toHaveProperty('resources');
    const resources = health['resources'] as Record<string, unknown>;
    expect(resources).toHaveProperty('templates');
  });

  it('health JSON contains environment object', () => {
    showHealth();
    const health = JSON.parse(String(consoleSpy.mock.calls[0]?.[0])) as Record<string, unknown>;
    expect(health).toHaveProperty('environment');
    const env = health['environment'] as Record<string, unknown>;
    expect(env).toHaveProperty('nodeVersion');
    expect(env).toHaveProperty('platform');
    expect(env).toHaveProperty('arch');
  });

  it('health JSON contains configuration object', () => {
    showHealth();
    const health = JSON.parse(String(consoleSpy.mock.calls[0]?.[0])) as Record<string, unknown>;
    expect(health).toHaveProperty('configuration');
    const config = health['configuration'] as Record<string, unknown>;
    expect(config).toHaveProperty('apiUrl');
    expect(config).toHaveProperty('cacheTTL');
    expect(config).toHaveProperty('rateLimit');
  });

  it('health configuration apiUrl uses default EP API URL when env var not set', () => {
    const savedEnv = process.env['EP_API_URL'];
    delete process.env['EP_API_URL'];

    showHealth();
    const health = JSON.parse(String(consoleSpy.mock.calls[0]?.[0])) as Record<string, unknown>;
    const config = health['configuration'] as Record<string, unknown>;
    expect(String(config['apiUrl'])).toContain('europarl.europa.eu');

    if (savedEnv !== undefined) {
      process.env['EP_API_URL'] = savedEnv;
    }
  });

  it('health JSON contains uptimeMs field', () => {
    showHealth();
    const health = JSON.parse(String(consoleSpy.mock.calls[0]?.[0])) as Record<string, unknown>;
    expect(health).toHaveProperty('uptimeMs');
    expect(typeof health['uptimeMs']).toBe('number');
  });

  it('health JSON contains epApiReachable field', () => {
    showHealth();
    const health = JSON.parse(String(consoleSpy.mock.calls[0]?.[0])) as Record<string, unknown>;
    expect(health).toHaveProperty('epApiReachable');
  });

  it('health JSON contains rateLimiter field', () => {
    showHealth();
    const health = JSON.parse(String(consoleSpy.mock.calls[0]?.[0])) as Record<string, unknown>;
    expect(health).toHaveProperty('rateLimiter');
  });

  it('respects EP_RATE_LIMIT env variable', () => {
    const savedEnv = process.env['EP_RATE_LIMIT'];
    process.env['EP_RATE_LIMIT'] = '30';

    showHealth();
    const health = JSON.parse(String(consoleSpy.mock.calls[0]?.[0])) as Record<string, unknown>;
    const config = health['configuration'] as Record<string, unknown>;
    expect(config['rateLimit']).toBe('30');

    if (savedEnv !== undefined) {
      process.env['EP_RATE_LIMIT'] = savedEnv;
    } else {
      delete process.env['EP_RATE_LIMIT'];
    }
  });
});

// ── parseCLIArgs ───────────────────────────────────────────────────

describe('parseCLIArgs', () => {
  it('returns all false for empty args array', () => {
    const opts = parseCLIArgs([]);
    expect(opts.help).toBe(false);
    expect(opts.version).toBe(false);
    expect(opts.health).toBe(false);
  });

  it('sets help=true for --help flag', () => {
    const opts = parseCLIArgs(['--help']);
    expect(opts.help).toBe(true);
    expect(opts.version).toBe(false);
    expect(opts.health).toBe(false);
  });

  it('sets help=true for -h short flag', () => {
    const opts = parseCLIArgs(['-h']);
    expect(opts.help).toBe(true);
    expect(opts.version).toBe(false);
    expect(opts.health).toBe(false);
  });

  it('sets version=true for --version flag', () => {
    const opts = parseCLIArgs(['--version']);
    expect(opts.help).toBe(false);
    expect(opts.version).toBe(true);
    expect(opts.health).toBe(false);
  });

  it('sets version=true for -v short flag', () => {
    const opts = parseCLIArgs(['-v']);
    expect(opts.help).toBe(false);
    expect(opts.version).toBe(true);
    expect(opts.health).toBe(false);
  });

  it('sets health=true for --health flag', () => {
    const opts = parseCLIArgs(['--health']);
    expect(opts.help).toBe(false);
    expect(opts.version).toBe(false);
    expect(opts.health).toBe(true);
  });

  it('ignores unknown flags', () => {
    const opts = parseCLIArgs(['--unknown', '--foo', 'bar']);
    expect(opts.help).toBe(false);
    expect(opts.version).toBe(false);
    expect(opts.health).toBe(false);
  });

  it('handles multiple flags together', () => {
    const opts = parseCLIArgs(['--help', '--version', '--health']);
    expect(opts.help).toBe(true);
    expect(opts.version).toBe(true);
    expect(opts.health).toBe(true);
  });

  it('handles mixed known and unknown flags', () => {
    const opts = parseCLIArgs(['--foo', '--help', '--bar']);
    expect(opts.help).toBe(true);
    expect(opts.version).toBe(false);
    expect(opts.health).toBe(false);
  });

  it('handles -h and --version together', () => {
    const opts = parseCLIArgs(['-h', '--version']);
    expect(opts.help).toBe(true);
    expect(opts.version).toBe(true);
    expect(opts.health).toBe(false);
  });

  it('returns CLIOptions shaped object', () => {
    const opts = parseCLIArgs([]);
    expect(opts).toHaveProperty('help');
    expect(opts).toHaveProperty('version');
    expect(opts).toHaveProperty('health');
  });

  it('does not set help for --helps (prefix match should not count)', () => {
    const opts = parseCLIArgs(['--helps']);
    expect(opts.help).toBe(false);
  });

  it('does not set version for --versions (prefix match should not count)', () => {
    const opts = parseCLIArgs(['--versions']);
    expect(opts.version).toBe(false);
  });

  it('handles process.argv style input with node and script paths', () => {
    const opts = parseCLIArgs(['node', 'server.js', '--help']);
    expect(opts.help).toBe(true);
  });
});
