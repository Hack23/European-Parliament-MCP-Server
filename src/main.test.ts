/**
 * Tests for src/main.ts – CLI entry point bootstrap.
 *
 * Tests the --timeout CLI argument by spawning `src/main.ts` via
 * `tsx` and verifying stdout/stderr and exit codes.
 */

import { describe, it, expect } from 'vitest';
import { execFileSync } from 'child_process';
import { resolve } from 'path';

const mainPath = resolve(import.meta.dirname, '..', 'src', 'main.ts');

function run(args: string[]): { stdout: string; stderr: string; exitCode: number } {
  try {
    const stdout = execFileSync('npx', ['tsx', mainPath, ...args], {
      encoding: 'utf-8',
      timeout: 15_000,
      env: { ...process.env, EP_REQUEST_TIMEOUT_MS: undefined },
    });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (error: unknown) {
    const err = error as { stdout?: string; stderr?: string; status?: number };
    return {
      stdout: err.stdout ?? '',
      stderr: err.stderr ?? '',
      exitCode: err.status ?? 1,
    };
  }
}

describe('main.ts CLI entry point', () => {
  // ── --help ────────────────────────────────────────────────────────
  it('--help prints help and exits 0', () => {
    const { stdout, exitCode } = run(['--help']);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('--timeout');
    expect(stdout).toContain('--help');
  });

  // ── --version ─────────────────────────────────────────────────────
  it('--version prints version and exits 0', () => {
    const { stdout, exitCode } = run(['--version']);
    expect(exitCode).toBe(0);
    expect(stdout).toMatch(/\d+\.\d+\.\d+/);
  });

  // ── --timeout + --health ──────────────────────────────────────────
  it('--timeout 90000 --health shows timeout in config', () => {
    const { stdout, exitCode } = run(['--timeout', '90000', '--health']);
    expect(exitCode).toBe(0);
    const health = JSON.parse(stdout) as Record<string, unknown>;
    const config = health['configuration'] as Record<string, unknown>;
    expect(config['requestTimeoutMs']).toBe('90000');
  });

  it('--health without --timeout shows default 10000', () => {
    const { stdout, exitCode } = run(['--health']);
    expect(exitCode).toBe(0);
    const health = JSON.parse(stdout) as Record<string, unknown>;
    const config = health['configuration'] as Record<string, unknown>;
    expect(config['requestTimeoutMs']).toBe('10000');
  });

  // ── --timeout error cases ─────────────────────────────────────────
  it('--timeout without value exits 1 with error message', () => {
    const { stderr, exitCode } = run(['--timeout']);
    expect(exitCode).toBe(1);
    expect(stderr).toContain('--timeout requires a positive integer');
  });

  it('--timeout abc exits 1 with error message', () => {
    const { stderr, exitCode } = run(['--timeout', 'abc']);
    expect(exitCode).toBe(1);
    expect(stderr).toContain('Invalid --timeout value');
  });

  it('--timeout 0 exits 1 with error message', () => {
    const { stderr, exitCode } = run(['--timeout', '0']);
    expect(exitCode).toBe(1);
    expect(stderr).toContain('Invalid --timeout value');
  });

  it('--timeout -1 exits 1 with error message', () => {
    const { stderr, exitCode } = run(['--timeout', '-1']);
    expect(exitCode).toBe(1);
    expect(stderr).toContain('--timeout requires a positive integer');
  });

  it('--timeout 10s (partially-numeric) exits 1 with error message', () => {
    const { stderr, exitCode } = run(['--timeout', '10s']);
    expect(exitCode).toBe(1);
    expect(stderr).toContain('Invalid --timeout value');
  });
});
