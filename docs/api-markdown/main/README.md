[**European Parliament MCP Server API v1.3.0**](../README.md)

***

[European Parliament MCP Server API](../modules.md) / main

# main

CLI entry point for the European Parliament MCP Server.

Parses CLI arguments (including `--timeout`) **before** importing
the server module, so that `process.env['EP_REQUEST_TIMEOUT_MS']`
is set before the EP API client singleton is created at
module-load time.

Precedence: `--timeout` CLI arg > `EP_REQUEST_TIMEOUT_MS` env var > default (60 s, from DEFAULT_TIMEOUTS.EP_API_REQUEST_MS)
