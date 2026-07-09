[**European Parliament MCP Server API v1.3.41**](../../../README.md)

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

> `readonly` **EP\_API\_REQUEST\_MS**: `60000` = `60_000`

### EP\_FEED\_SLOW\_REQUEST\_MS

> `readonly` **EP\_FEED\_SLOW\_REQUEST\_MS**: `120000` = `120_000`

### HEALTH\_CHECK\_MS

> `readonly` **HEALTH\_CHECK\_MS**: `3000` = `3_000`

### RETRY\_DELAY\_MS

> `readonly` **RETRY\_DELAY\_MS**: `1000` = `1_000`
