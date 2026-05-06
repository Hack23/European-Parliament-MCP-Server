[**European Parliament MCP Server API v1.3.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/errorHandler](../README.md) / extractTimeoutMs

# Function: extractTimeoutMs()

> **extractTimeoutMs**(`error`): `number` \| `undefined`

Defined in: [tools/shared/errorHandler.ts:66](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errorHandler.ts#L66)

Extracts the configured timeout duration (in ms) from a timeout-related error,
if available. Returns `undefined` when the duration cannot be determined.

Prefers structured `details.timeoutMs` metadata on `APIError(408)` (set by
`baseClient.toAPIError`), falling back to regex on the error message.
Recurses into `Error.cause` chains.

## Parameters

### error

`unknown`

A timeout-related error

## Returns

`number` \| `undefined`

The timeout duration in milliseconds, or `undefined`
