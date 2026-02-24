[**European Parliament MCP Server API v0.7.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/timeout](../README.md) / TimeoutError

# Class: TimeoutError

Defined in: [utils/timeout.ts:22](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/utils/timeout.ts#L22)

Timeout error thrown when an operation exceeds its time limit

## Example

```typescript
if (Date.now() - startTime > timeout) {
  throw new TimeoutError('Operation timed out after 10s');
}
```

## Extends

- [`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

## Constructors

### Constructor

> **new TimeoutError**(`message`, `timeoutMs?`): `TimeoutError`

Defined in: [utils/timeout.ts:29](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/utils/timeout.ts#L29)

Create a new timeout error

#### Parameters

##### message

`string`

Description of the timeout

##### timeoutMs?

`number`

The timeout duration in milliseconds

#### Returns

`TimeoutError`

#### Overrides

`Error.constructor`

## Properties

### timeoutMs?

> `readonly` `optional` **timeoutMs**: `number`

Defined in: [utils/timeout.ts:31](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/utils/timeout.ts#L31)

The timeout duration in milliseconds
