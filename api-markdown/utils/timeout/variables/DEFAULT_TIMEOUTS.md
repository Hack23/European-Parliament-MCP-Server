[**European Parliament MCP Server API v1.2.19**](../../../README.md)

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

Standard EP API HTTP request (60 s — some meeting sub-endpoints are slow)

### EP\_FEED\_SLOW\_REQUEST\_MS

> `readonly` **EP\_FEED\_SLOW\_REQUEST\_MS**: `120000` = `120_000`

Extended timeout for known slow EP API feed endpoints (120 s).

The `procedures/feed` and `events/feed` endpoints on the EP Open Data
Portal are significantly slower than other feed endpoints (e.g.
`adopted-texts/feed`) and routinely exceed the standard 60 s timeout
when queried with `timeframe=one-month`.  This extended timeout gives
those endpoints enough headroom to respond without falling back to
empty timeout responses.

### HEALTH\_CHECK\_MS

> `readonly` **HEALTH\_CHECK\_MS**: `3000` = `3_000`

Short health-check probe (3 s)

### RETRY\_DELAY\_MS

> `readonly` **RETRY\_DELAY\_MS**: `1000` = `1_000`

Retry delay base (1 s)
