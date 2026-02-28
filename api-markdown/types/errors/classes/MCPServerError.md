[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/errors](../README.md) / MCPServerError

# Class: MCPServerError

Defined in: [types/errors.ts:33](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/errors.ts#L33)

Base error class for European Parliament MCP Server

Provides structured error handling with error codes, HTTP status codes,
and optional details for debugging. All errors extend this base class.

## Example

```typescript
throw new MCPServerError(
  'Configuration not found',
  'CONFIG_ERROR',
  500,
  { configFile: 'mcp.json' }
);
```

## Extends

- [`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

## Extended by

- [`ValidationError`](ValidationError.md)
- [`RateLimitError`](RateLimitError.md)
- [`EPAPIError`](EPAPIError.md)
- [`GDPRComplianceError`](GDPRComplianceError.md)

## Constructors

### Constructor

> **new MCPServerError**(`message`, `code`, `statusCode?`, `details?`): `MCPServerError`

Defined in: [types/errors.ts:42](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/errors.ts#L42)

Create a new MCP Server error

#### Parameters

##### message

`string`

Human-readable error message

##### code

`string`

Machine-readable error code (e.g., 'VALIDATION_ERROR')

##### statusCode?

`number` = `500`

HTTP status code (default: 500)

##### details?

`unknown`

Optional additional error details for debugging

#### Returns

`MCPServerError`

#### Overrides

`Error.constructor`

## Properties

### code

> `readonly` **code**: `string`

Defined in: [types/errors.ts:44](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/errors.ts#L44)

Machine-readable error code (e.g., 'VALIDATION_ERROR')

***

### statusCode

> `readonly` **statusCode**: `number` = `500`

Defined in: [types/errors.ts:45](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/errors.ts#L45)

HTTP status code (default: 500)

***

### details?

> `readonly` `optional` **details**: `unknown`

Defined in: [types/errors.ts:46](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/errors.ts#L46)

Optional additional error details for debugging
