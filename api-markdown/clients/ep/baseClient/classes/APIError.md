[**European Parliament MCP Server API v0.9.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/baseClient](../README.md) / APIError

# Class: APIError

Defined in: [clients/ep/baseClient.ts:56](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L56)

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

Defined in: [clients/ep/baseClient.ts:57](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L57)

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

Defined in: [clients/ep/baseClient.ts:60](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L60)

***

### statusCode?

> `optional` **statusCode**: `number`

Defined in: [clients/ep/baseClient.ts:59](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L59)
