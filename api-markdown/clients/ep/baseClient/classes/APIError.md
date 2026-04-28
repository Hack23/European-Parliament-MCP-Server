[**European Parliament MCP Server API v1.2.16**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/baseClient](../README.md) / APIError

# Class: APIError

Defined in: [clients/ep/baseClient.ts:155](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L155)

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

Defined in: [clients/ep/baseClient.ts:156](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L156)

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

Defined in: [clients/ep/baseClient.ts:159](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L159)

***

### statusCode?

> `optional` **statusCode?**: `number`

Defined in: [clients/ep/baseClient.ts:158](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L158)
