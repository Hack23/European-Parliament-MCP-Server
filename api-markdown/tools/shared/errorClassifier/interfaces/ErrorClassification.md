[**European Parliament MCP Server API v1.1.28**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/errorClassifier](../README.md) / ErrorClassification

# Interface: ErrorClassification

Defined in: [tools/shared/errorClassifier.ts:17](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errorClassifier.ts#L17)

Structured error classification result for MCP responses.

## Properties

### errorCategory

> **errorCategory**: [`ErrorCategory`](../../errors/type-aliases/ErrorCategory.md)

Defined in: [tools/shared/errorClassifier.ts:19](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errorClassifier.ts#L19)

***

### errorCode

> **errorCode**: [`ErrorCode`](../../errors/type-aliases/ErrorCode.md)

Defined in: [tools/shared/errorClassifier.ts:18](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errorClassifier.ts#L18)

***

### retryable

> **retryable**: `boolean`

Defined in: [tools/shared/errorClassifier.ts:21](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errorClassifier.ts#L21)

***

### httpStatus?

> `optional` **httpStatus?**: `number`

Defined in: [tools/shared/errorClassifier.ts:20](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errorClassifier.ts#L20)
