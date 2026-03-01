[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/auditLogger](../README.md) / toErrorMessage

# Function: toErrorMessage()

> **toErrorMessage**(`error`): `string`

Defined in: [utils/auditLogger.ts:449](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L449)

Extract a safe, human-readable error message from an unknown caught value.
Returns `error.message` for Error instances; `'Unknown error'` otherwise.
Avoids `String(error)` which can produce `"[object Object]"` for non-Error
throws and may expose custom `toString()` output unexpectedly.

## Parameters

### error

`unknown`

Caught error value (unknown type from catch clause)

## Returns

`string`

Human-readable error message safe for audit logging
