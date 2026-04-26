[**European Parliament MCP Server API v1.2.15**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [server/cliUtils](../README.md) / resolveEffectiveTimeout

# Function: resolveEffectiveTimeout()

> **resolveEffectiveTimeout**(): `number`

Defined in: [server/cliUtils.ts:70](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/cliUtils.ts#L70)

Resolve the effective timeout value in milliseconds from the environment.

This function only resolves the **environment-level** precedence:
  `EP_REQUEST_TIMEOUT_MS` env var → [DEFAULT\_REQUEST\_TIMEOUT\_MS](../variables/DEFAULT_REQUEST_TIMEOUT_MS.md)

The full precedence chain (including the `--timeout` CLI argument) is
handled by `applyTimeoutArg()` in `src/main.ts`, which sets the env var
**before** modules are loaded.

Invalid / empty env values are silently ignored (fall through to default).

## Returns

`number`

Effective timeout in milliseconds
