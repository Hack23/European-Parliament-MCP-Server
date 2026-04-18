[**European Parliament MCP Server API v1.2.9**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/baseClient](../README.md) / APIError

# Class: APIError

Defined in: [clients/ep/baseClient.ts:143](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L143)

API Error thrown when European Parliament API requests fail.

## Example

```typescript
throw new APIError('EP API request failed: Not Found', 404, { endpoint: '/meps/999999' });
```

## Extends

- [`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

## Constructors

### Constructor

> **new APIError**(`message`, `statusCode?`, `details?`): `APIError`

Defined in: [clients/ep/baseClient.ts:144](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L144)

#### Parameters

##### message

`string`

##### statusCode?

`number`

##### details?

`unknown`

#### Returns

`APIError`

#### Overrides

`Error.constructor`

## Properties

### details?

> `optional` **details?**: `unknown`

Defined in: [clients/ep/baseClient.ts:147](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L147)

***

### statusCode?

> `optional` **statusCode?**: `number`

Defined in: [clients/ep/baseClient.ts:146](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L146)
