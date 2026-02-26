[**European Parliament MCP Server API v0.8.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/timeout](../README.md) / TimeoutConfig

# Interface: TimeoutConfig

Defined in: [utils/timeout.ts:18](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/utils/timeout.ts#L18)

Typed configuration for timeout operations.

Centralises timeout settings in a single object so they can be
stored, passed, and validated without scattered magic numbers.

## Properties

### timeoutMs

> **timeoutMs**: `number`

Defined in: [utils/timeout.ts:20](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/utils/timeout.ts#L20)

Timeout duration in milliseconds (must be > 0)

***

### errorMessage?

> `optional` **errorMessage**: `string`

Defined in: [utils/timeout.ts:24](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/utils/timeout.ts#L24)

Custom error message override for timeout errors

***

### operationName?

> `optional` **operationName**: `string`

Defined in: [utils/timeout.ts:22](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/utils/timeout.ts#L22)

Optional human-readable label for the timed operation
