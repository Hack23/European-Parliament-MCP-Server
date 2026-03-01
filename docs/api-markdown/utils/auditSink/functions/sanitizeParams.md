[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/auditSink](../README.md) / sanitizeParams

# Function: sanitizeParams()

> **sanitizeParams**(`params`, `sensitiveKeys?`): [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Defined in: [utils/auditSink.ts:175](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L175)

Returns a copy of `params` with sensitive values replaced by `'[REDACTED]'`.

Only **top-level** keys are inspected. Nested objects are passed through
unchanged, so callers should sanitise nested params separately if needed.

## Parameters

### params

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Original parameter map

### sensitiveKeys?

readonly `string`[] = `DEFAULT_SENSITIVE_KEYS`

Keys to redact (defaults to [DEFAULT\_SENSITIVE\_KEYS](../variables/DEFAULT_SENSITIVE_KEYS.md))

## Returns

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Sanitised copy of `params`

## Security

This function does NOT recurse into nested objects.
  Callers are responsible for sanitising nested parameter structures.

## Since

0.9.0
