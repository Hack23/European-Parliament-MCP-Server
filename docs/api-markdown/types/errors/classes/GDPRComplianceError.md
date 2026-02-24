[**European Parliament MCP Server API v0.6.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/errors](../README.md) / GDPRComplianceError

# Class: GDPRComplianceError

Defined in: [types/errors.ts:169](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/errors.ts#L169)

GDPR compliance error

Thrown when an operation would violate GDPR requirements, such as:
- Accessing personal data without proper authorization
- Caching personal data beyond retention limits
- Missing required audit logging
- Data minimization violations

Always returns HTTP 403 status to indicate forbidden operation.

## Example

```typescript
if (cacheAge > maxPersonalDataCacheAge) {
  throw new GDPRComplianceError(
    'Personal data cache expired',
    { cacheAge, maxAge: maxPersonalDataCacheAge }
  );
}
```

## Extends

- [`MCPServerError`](MCPServerError.md)

## Constructors

### Constructor

> **new GDPRComplianceError**(`message`, `details?`): `GDPRComplianceError`

Defined in: [types/errors.ts:176](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/errors.ts#L176)

Create a new GDPR compliance error

#### Parameters

##### message

`string`

Description of GDPR violation

##### details?

`unknown`

Optional details about the violation

#### Returns

`GDPRComplianceError`

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
