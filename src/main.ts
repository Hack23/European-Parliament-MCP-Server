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

// ── Pre-import: apply --timeout to env before any module creates epClient ──
const rawArgs = process.argv.slice(2);
const timeoutIdx = rawArgs.indexOf('--timeout');
if (timeoutIdx !== -1) {
  const value = rawArgs[timeoutIdx + 1];
  if (value === undefined || value.trim().length === 0 || value.startsWith('-')) {
    console.error('Error: --timeout requires a positive integer value (milliseconds).');
    process.exit(1);
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    console.error(`Error: Invalid --timeout value "${value}". Must be a positive integer (milliseconds).`);
    process.exit(1);
  }
  process.env['EP_REQUEST_TIMEOUT_MS'] = String(parsed);
}

// ── Dynamic import after env vars are set ──────────────────────────────────
const { parseCLIArgs, showHelp, showVersion, showHealth } = await import('./server/cli.js');
const { EuropeanParliamentMCPServer, SERVER_NAME } = await import('./index.js');

const opts = parseCLIArgs(rawArgs);

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
