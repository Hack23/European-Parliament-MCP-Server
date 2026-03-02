[**European Parliament MCP Server API v1.1.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/errors](../README.md) / ToolError

# Class: ToolError

Defined in: [tools/shared/errors.ts:12](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errors.ts#L12)

Structured error class that all MCP tools use for consistent error reporting.
Ensures tool name, operation, and safe context are always included without
leaking internal implementation details to clients.

## Extends

- [`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

## Constructors

### Constructor

> **new ToolError**(`options`): `ToolError`

Defined in: [tools/shared/errors.ts:18](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errors.ts#L18)

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

###### isRetryable?

`boolean`

#### Returns

`ToolError`

#### Overrides

`Error.constructor`

## Properties

### isRetryable

> `readonly` **isRetryable**: `boolean`

Defined in: [tools/shared/errors.ts:15](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errors.ts#L15)

***

### operation

> `readonly` **operation**: `string`

Defined in: [tools/shared/errors.ts:14](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errors.ts#L14)

***

### toolName

> `readonly` **toolName**: `string`

Defined in: [tools/shared/errors.ts:13](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errors.ts#L13)

***

### cause?

> `readonly` `optional` **cause**: [`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Defined in: [tools/shared/errors.ts:16](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errors.ts#L16)

#### Overrides

`Error.cause`
