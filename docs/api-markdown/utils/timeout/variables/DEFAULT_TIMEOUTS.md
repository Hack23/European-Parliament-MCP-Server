[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/timeout](../README.md) / DEFAULT\_TIMEOUTS

# Variable: DEFAULT\_TIMEOUTS

> `const` **DEFAULT\_TIMEOUTS**: `object`

Defined in: [utils/timeout.ts:32](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/timeout.ts#L32)

Default timeout configurations for common operation types.
These are compile-time constants; override by passing a custom [TimeoutConfig](../interfaces/TimeoutConfig.md)
at the call site rather than relying on environment variables.

## Type Declaration

### EP\_API\_REQUEST\_MS

> `readonly` **EP\_API\_REQUEST\_MS**: `10000` = `10_000`

Standard EP API HTTP request (10 s)

### HEALTH\_CHECK\_MS

> `readonly` **HEALTH\_CHECK\_MS**: `3000` = `3_000`

Short health-check probe (3 s)

### RETRY\_DELAY\_MS

> `readonly` **RETRY\_DELAY\_MS**: `1000` = `1_000`

Retry delay base (1 s)
