[**European Parliament MCP Server API v1.3.37**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/baseClient](../README.md) / APIError

# Class: APIError

Defined in: [clients/ep/baseClient.ts:145](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L145)

API Error thrown when European Parliament API requests fail.

When thrown from [BaseEPClient](BaseEPClient.md)'s HTTP layer, the message always
includes the numeric HTTP status code and, when present, the HTTP reason
phrase (`statusText`). Some HTTP/2 responses omit `statusText`, in which
case the message contains only the status code — the status code is
therefore always surfaced in the message, never empty.

Message format: `EP API request failed: <status>[ <statusText>]`

## Example

```typescript
// HTTP/1.1 with a reason phrase
throw new APIError('EP API request failed: 404 Not Found', 404, { endpoint: '/meps/999999' });

// HTTP/2 where statusText is empty
throw new APIError('EP API request failed: 404', 404, { endpoint: '/meps/999999' });
```

## Extends

- [`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

## Constructors

### Constructor

> **new APIError**(`message`, `statusCode?`, `details?`): `APIError`

Defined in: [clients/ep/baseClient.ts:146](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L146)

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

Defined in: [clients/ep/baseClient.ts:149](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L149)

***

### statusCode?

> `optional` **statusCode?**: `number`

Defined in: [clients/ep/baseClient.ts:148](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L148)
