[**European Parliament MCP Server API v0.6.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/errors](../README.md) / RateLimitError

# Class: RateLimitError

Defined in: [types/errors.ts:99](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/errors.ts#L99)

Rate limit error when API rate limit is exceeded

Thrown when the client exceeds the configured rate limit.
Always returns HTTP 429 status and includes retry-after information.

## Example

```typescript
if (requestCount > maxRequests) {
  throw new RateLimitError(
    'Rate limit exceeded',
    60 // retry after 60 seconds
  );
}
```

## Extends

- [`MCPServerError`](MCPServerError.md)

## Constructors

### Constructor

> **new RateLimitError**(`message`, `retryAfter?`): `RateLimitError`

Defined in: [types/errors.ts:106](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/errors.ts#L106)

Create a new rate limit error

#### Parameters

##### message

`string`

Description of rate limit violation

##### retryAfter?

`number`

Number of seconds to wait before retrying (optional)

#### Returns

`RateLimitError`

#### Overrides

[`MCPServerError`](MCPServerError.md).[`constructor`](MCPServerError.md#constructor)

## Properties

### code

> `readonly` **code**: `string`

Defined in: [types/errors.ts:44](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/errors.ts#L44)

Machine-readable error code (e.g., 'VALIDATION_ERROR')

#### Inherited from

[`MCPServerError`](MCPServerError.md).[`code`](MCPServerError.md#code)

***

### statusCode

> `readonly` **statusCode**: `number` = `500`

Defined in: [types/errors.ts:45](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/errors.ts#L45)

HTTP status code (default: 500)

#### Inherited from

[`MCPServerError`](MCPServerError.md).[`statusCode`](MCPServerError.md#statuscode)

***

### details?

> `readonly` `optional` **details**: `unknown`

Defined in: [types/errors.ts:46](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/errors.ts#L46)

Optional additional error details for debugging

#### Inherited from

[`MCPServerError`](MCPServerError.md).[`details`](MCPServerError.md#details)

***

### retryAfter?

> `readonly` `optional` **retryAfter**: `number`

Defined in: [types/errors.ts:108](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/errors.ts#L108)

Number of seconds to wait before retrying (optional)
