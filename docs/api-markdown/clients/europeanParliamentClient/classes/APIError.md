[**European Parliament MCP Server API v0.7.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [clients/europeanParliamentClient](../README.md) / APIError

# Class: APIError

Defined in: [clients/europeanParliamentClient.ts:106](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L106)

API Error thrown when European Parliament API requests fail.

Captures HTTP status codes and error details for proper error handling
and client-side recovery strategies. All API errors include optional
diagnostic information for debugging.

## Examples

```typescript
// Throwing an API error
throw new APIError(
  'EP API request failed: Not Found',
  404,
  { endpoint: '/meps/999999' }
);
```

```typescript
// Handling API errors
try {
  const mep = await client.getMEPDetails('invalid-id');
} catch (error) {
  if (error instanceof APIError) {
    console.error(`API Error (${error.statusCode}): ${error.message}`);
    console.error('Details:', error.details);
  }
}
```

## Extends

- [`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

## Constructors

### Constructor

> **new APIError**(`message`, `statusCode?`, `details?`): `APIError`

Defined in: [clients/europeanParliamentClient.ts:114](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L114)

Creates a new API error instance.

#### Parameters

##### message

`string`

Human-readable error message

##### statusCode?

`number`

HTTP status code (optional, e.g., 404, 500)

##### details?

`unknown`

Additional error context (optional)

#### Returns

`APIError`

#### Overrides

`Error.constructor`

## Properties

### details?

> `optional` **details**: `unknown`

Defined in: [clients/europeanParliamentClient.ts:117](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L117)

Additional error context (optional)

***

### statusCode?

> `optional` **statusCode**: `number`

Defined in: [clients/europeanParliamentClient.ts:116](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L116)

HTTP status code (optional, e.g., 404, 500)
