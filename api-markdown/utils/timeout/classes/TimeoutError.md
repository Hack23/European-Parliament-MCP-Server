[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/timeout](../README.md) / TimeoutError

# Class: TimeoutError

Defined in: [utils/timeout.ts:51](https://github.com/Hack23/European-Parliament-MCP-Server/blob/006b62840b740489118388cc87b431ee92a42c24/src/utils/timeout.ts#L51)

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

Defined in: [utils/timeout.ts:58](https://github.com/Hack23/European-Parliament-MCP-Server/blob/006b62840b740489118388cc87b431ee92a42c24/src/utils/timeout.ts#L58)

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

Defined in: [utils/timeout.ts:60](https://github.com/Hack23/European-Parliament-MCP-Server/blob/006b62840b740489118388cc87b431ee92a42c24/src/utils/timeout.ts#L60)

The timeout duration in milliseconds
