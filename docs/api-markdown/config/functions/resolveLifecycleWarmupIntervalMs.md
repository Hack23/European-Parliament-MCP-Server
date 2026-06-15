[**European Parliament MCP Server API v1.3.22**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / [config](../README.md) / resolveLifecycleWarmupIntervalMs

# Function: resolveLifecycleWarmupIntervalMs()

> **resolveLifecycleWarmupIntervalMs**(`env?`): `number`

Defined in: [config.ts:85](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/config.ts#L85)

Resolve the lifecycle warmup interval from the environment, falling back
to [DEFAULT\_LIFECYCLE\_WARMUP\_INTERVAL\_MS](../variables/DEFAULT_LIFECYCLE_WARMUP_INTERVAL_MS.md) when the variable is
unset, empty, or not a finite positive integer.

Successfully parsed values are clamped to
`[LIFECYCLE_WARMUP_MIN_INTERVAL_MS, LIFECYCLE_WARMUP_MAX_INTERVAL_MS]`
to defend against pathological configuration (e.g. a 1 ms interval that
would melt the rate-limit budget).

## Parameters

### env?

`ProcessEnv` = `process.env`

Environment map (defaults to `process.env`); injected for tests.

## Returns

`number`

Effective warmup interval in milliseconds.

## Security

Input validation per ISMS SC-002 — environment values are
  parsed and clamped before they influence scheduler behaviour.

## Since

0.9.0
