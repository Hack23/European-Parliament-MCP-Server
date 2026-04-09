[**European Parliament MCP Server API v1.2.1**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / server/cliUtils

# server/cliUtils

Lightweight CLI utility functions.

This module intentionally has **no** imports from the EP client or
heavyweight server modules, so it can be loaded by `src/main.ts`
**before** the EP API client singleton is constructed.

`timeout.ts` is a lightweight utility with zero heavyweight deps,
so importing [DEFAULT\_TIMEOUTS](../../utils/timeout/variables/DEFAULT_TIMEOUTS.md) is safe here.

## Variables

- [DEFAULT\_REQUEST\_TIMEOUT\_MS](variables/DEFAULT_REQUEST_TIMEOUT_MS.md)

## Functions

- [parseTimeoutValue](functions/parseTimeoutValue.md)
- [resolveEffectiveTimeout](functions/resolveEffectiveTimeout.md)
