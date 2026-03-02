[**European Parliament MCP Server API v1.1.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/baseClient](../README.md) / APIError

# Class: APIError

Defined in: [clients/ep/baseClient.ts:139](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L139)

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

Defined in: [clients/ep/baseClient.ts:140](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L140)

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

> `optional` **details**: `unknown`

Defined in: [clients/ep/baseClient.ts:143](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L143)

***

### statusCode?

> `optional` **statusCode**: `number`

Defined in: [clients/ep/baseClient.ts:142](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L142)
