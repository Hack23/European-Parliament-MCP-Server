[**European Parliament MCP Server API v1.2.19**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/feedUtils](../README.md) / FeedErrorMeta

# Interface: FeedErrorMeta

Defined in: [tools/shared/feedUtils.ts:88](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/feedUtils.ts#L88)

Optional machine-readable metadata attached to an empty/failed feed response.

Allows downstream consumers to classify the failure and decide whether to
retry the request, fall back to a non-feed endpoint, or skip entirely.

## Properties

### errorCode?

> `optional` **errorCode?**: [`FeedErrorCode`](../type-aliases/FeedErrorCode.md)

Defined in: [tools/shared/feedUtils.ts:90](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/feedUtils.ts#L90)

Machine-readable failure classification.

***

### retryable?

> `optional` **retryable?**: `boolean`

Defined in: [tools/shared/feedUtils.ts:92](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/feedUtils.ts#L92)

Whether the failure is transient and the request should be retried.

***

### upstream?

> `optional` **upstream?**: `object`

Defined in: [tools/shared/feedUtils.ts:94](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/feedUtils.ts#L94)

Information about the upstream error, when available.

#### errorMessage?

> `optional` **errorMessage?**: `string`

Raw error message from the upstream response body.

#### statusCode?

> `optional` **statusCode?**: `number`

HTTP status code parsed from the upstream error message, if present.
