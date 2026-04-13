[**European Parliament MCP Server API v1.2.6**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/errorHandler](../README.md) / isTimeoutRelatedError

# Function: isTimeoutRelatedError()

> **isTimeoutRelatedError**(`error`): `boolean`

Defined in: [tools/shared/errorHandler.ts:25](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errorHandler.ts#L25)

Checks whether an error represents an EP API request timeout.

Detects timeouts regardless of how deeply they are wrapped by
recursively walking the `cause` chain:
- Direct `TimeoutError`
- `APIError` with status 408 (produced by `baseClient.toAPIError`)
- `ToolError` or `Error` whose `cause` is any of the above (at any depth)

## Parameters

### error

`unknown`

Caught error value

## Returns

`boolean`

`true` when the root cause is a timeout
