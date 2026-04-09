[**European Parliament MCP Server API v1.2.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/errorClassifier](../README.md) / ErrorClassification

# Interface: ErrorClassification

Defined in: [tools/shared/errorClassifier.ts:18](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errorClassifier.ts#L18)

Structured error classification result for MCP responses.

## Properties

### errorCategory

> **errorCategory**: [`ErrorCategory`](../../errors/type-aliases/ErrorCategory.md)

Defined in: [tools/shared/errorClassifier.ts:20](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errorClassifier.ts#L20)

***

### errorCode

> **errorCode**: [`ErrorCode`](../../errors/type-aliases/ErrorCode.md)

Defined in: [tools/shared/errorClassifier.ts:19](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errorClassifier.ts#L19)

***

### retryable

> **retryable**: `boolean`

Defined in: [tools/shared/errorClassifier.ts:22](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errorClassifier.ts#L22)

***

### httpStatus?

> `optional` **httpStatus?**: `number`

Defined in: [tools/shared/errorClassifier.ts:21](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errorClassifier.ts#L21)
