[**European Parliament MCP Server API v0.6.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/errors](../README.md) / EPAPIError

# Class: EPAPIError

Defined in: [types/errors.ts:134](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/errors.ts#L134)

EP API error for European Parliament API failures

Thrown when the European Parliament API returns an error or
when communication with the API fails. Preserves the original
status code from the upstream API.

## Example

```typescript
const response = await fetch(epApiUrl);
if (!response.ok) {
  throw new EPAPIError(
    'Failed to fetch MEP data',
    response.status,
    { url: epApiUrl, status: response.statusText }
  );
}
```

## Extends

- [`MCPServerError`](MCPServerError.md)

## Constructors

### Constructor

> **new EPAPIError**(`message`, `statusCode`, `details?`): `EPAPIError`

Defined in: [types/errors.ts:142](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/errors.ts#L142)

Create a new EP API error

#### Parameters

##### message

`string`

Description of API failure

##### statusCode

`number`

HTTP status code from EP API

##### details?

`unknown`

Optional details about the failure

#### Returns

`EPAPIError`

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
