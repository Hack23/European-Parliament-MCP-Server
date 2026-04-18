[**European Parliament MCP Server API v1.2.9**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/errors](../README.md) / ToolError

# Class: ToolError

Defined in: [tools/shared/errors.ts:39](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errors.ts#L39)

Structured error class that all MCP tools use for consistent error reporting.
Ensures tool name, operation, and safe context are always included without
leaking internal implementation details to clients.

## Extends

- [`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

## Constructors

### Constructor

> **new ToolError**(`options`): `ToolError`

Defined in: [tools/shared/errors.ts:48](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errors.ts#L48)

#### Parameters

##### options

###### message

`string`

###### operation

`string`

###### toolName

`string`

###### cause?

`unknown`

###### errorCategory?

[`ErrorCategory`](../type-aliases/ErrorCategory.md)

###### errorCode?

[`ErrorCode`](../type-aliases/ErrorCode.md)

###### httpStatus?

`number`

###### isRetryable?

`boolean`

#### Returns

`ToolError`

#### Overrides

`Error.constructor`

## Properties

### isRetryable

> `readonly` **isRetryable**: `boolean`

Defined in: [tools/shared/errors.ts:42](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errors.ts#L42)

***

### operation

> `readonly` **operation**: `string`

Defined in: [tools/shared/errors.ts:41](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errors.ts#L41)

***

### toolName

> `readonly` **toolName**: `string`

Defined in: [tools/shared/errors.ts:40](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errors.ts#L40)

***

### cause?

> `readonly` `optional` **cause?**: [`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Defined in: [tools/shared/errors.ts:46](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errors.ts#L46)

#### Overrides

`Error.cause`

***

### errorCategory?

> `readonly` `optional` **errorCategory?**: [`ErrorCategory`](../type-aliases/ErrorCategory.md)

Defined in: [tools/shared/errors.ts:44](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errors.ts#L44)

***

### errorCode?

> `readonly` `optional` **errorCode?**: [`ErrorCode`](../type-aliases/ErrorCode.md)

Defined in: [tools/shared/errors.ts:43](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errors.ts#L43)

***

### httpStatus?

> `readonly` `optional` **httpStatus?**: `number`

Defined in: [tools/shared/errors.ts:45](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errors.ts#L45)
