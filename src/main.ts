#!/usr/bin/env node
/**
 * CLI entry point for the European Parliament MCP Server.
 *
 * Parses CLI arguments (including `--timeout`) **before** importing
 * the server module, so that `process.env['EP_REQUEST_TIMEOUT_MS']`
 * is set before the EP API client singleton is created at
 * module-load time.
 *
 * Precedence: `--timeout` CLI arg > `EP_REQUEST_TIMEOUT_MS` env var > default (10 s)
 *
 * @module main
 */

import { parseTimeoutValue } from './server/cliUtils.js';

/**
 * Apply `--timeout <ms>` from argv to `process.env['EP_REQUEST_TIMEOUT_MS']`
 * and return the remaining args with `--timeout` and its value stripped out.
 *
 * Exits the process with code 1 if `--timeout` is present but the value is
 * missing or invalid.
 */
function applyTimeoutArg(args: readonly string[]): string[] {
  const timeoutIdx = args.indexOf('--timeout');
  if (timeoutIdx === -1) {
    return [...args];
  }

  const raw = args[timeoutIdx + 1];
  if (raw === undefined || raw.startsWith('-')) {
    console.error('Error: --timeout requires a positive integer value (milliseconds).');
    process.exit(1);
  }

  const parsed = parseTimeoutValue(raw);
  if (parsed === undefined) {
    console.error(`Error: Invalid --timeout value "${raw}". Must be a positive integer (milliseconds).`);
    process.exit(1);
  }

  process.env['EP_REQUEST_TIMEOUT_MS'] = String(parsed);
  return args.filter((_, index) => index !== timeoutIdx && index !== timeoutIdx + 1);
}

// ── Pre-import: apply --timeout to env before any module creates epClient ──
const rawArgs = process.argv.slice(2);
const sanitizedArgs = applyTimeoutArg(rawArgs);

// ── Dynamic import after env vars are set ──────────────────────────────────
const { parseCLIArgs, showHelp, showVersion, showHealth } = await import('./server/cli.js');
const { EuropeanParliamentMCPServer, SERVER_NAME } = await import('./index.js');

const opts = parseCLIArgs(sanitizedArgs);

if (opts.help === true) {
  showHelp();
  process.exit(0);
}

if (opts.version === true) {
  showVersion();
  process.exit(0);
}

if (opts.health === true) {
  showHealth();
  process.exit(0);
}

// ── Start MCP server (default behaviour) ───────────────────────────────────
const server = new EuropeanParliamentMCPServer();

function handleShutdownSignal(signal: string): void {
  console.error(`[${SERVER_NAME}] Received ${signal} — exiting`);
  process.exit(0);
}

process.once('SIGTERM', () => { handleShutdownSignal('SIGTERM'); });
process.once('SIGINT', () => { handleShutdownSignal('SIGINT'); });

server.start().catch((error: unknown) => {
  console.error('[FATAL] Server startup failed:', error);
  process.exit(1);
});
