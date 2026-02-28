[**European Parliament MCP Server API v0.9.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/errors](../README.md) / ValidationError

# Class: ValidationError

Defined in: [types/errors.ts:70](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/errors.ts#L70)

Validation error for input validation failures

Thrown when user input fails validation (e.g., invalid country code,
out of range limit, malformed ID). Always returns HTTP 400 status.

## Example

```typescript
if (!isValidCountryCode(country)) {
  throw new ValidationError(
    'Invalid country code',
    { country, expected: 'ISO 3166-1 alpha-2' }
  );
}
```

## Extends

- [`MCPServerError`](MCPServerError.md)

## Constructors

### Constructor

> **new ValidationError**(`message`, `details?`): `ValidationError`

Defined in: [types/errors.ts:77](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/errors.ts#L77)

Create a new validation error

#### Parameters

##### message

`string`

Description of validation failure

##### details?

`unknown`

Optional details about what failed validation

#### Returns

`ValidationError`

#### Overrides

[`MCPServerError`](MCPServerError.md).[`constructor`](MCPServerError.md#constructor)

## Properties

### code

> `readonly` **code**: `string`

Defined in: [types/errors.ts:44](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/errors.ts#L44)

Machine-readable error code (e.g., 'VALIDATION_ERROR')

#### Inherited from

[`MCPServerError`](MCPServerError.md).[`code`](MCPServerError.md#code)

***

### statusCode

> `readonly` **statusCode**: `number` = `500`

Defined in: [types/errors.ts:45](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/errors.ts#L45)

HTTP status code (default: 500)

#### Inherited from

[`MCPServerError`](MCPServerError.md).[`statusCode`](MCPServerError.md#statuscode)

***

### details?

> `readonly` `optional` **details**: `unknown`

Defined in: [types/errors.ts:46](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/errors.ts#L46)

Optional additional error details for debugging

#### Inherited from

[`MCPServerError`](MCPServerError.md).[`details`](MCPServerError.md#details)
