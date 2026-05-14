[**European Parliament MCP Server API v1.3.4**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/timeout](../README.md) / TimeoutError

# Class: TimeoutError

Defined in: [utils/timeout.ts:49](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/timeout.ts#L49)

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

Defined in: [utils/timeout.ts:56](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/timeout.ts#L56)

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

> `readonly` `optional` **timeoutMs?**: `number`

Defined in: [utils/timeout.ts:58](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/timeout.ts#L58)

The timeout duration in milliseconds
