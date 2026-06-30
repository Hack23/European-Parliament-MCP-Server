[**European Parliament MCP Server API v1.3.31**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/feedUtils](../README.md) / FeedErrorMeta

# Interface: FeedErrorMeta

Defined in: [tools/shared/feedUtils.ts:114](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/feedUtils.ts#L114)

Optional machine-readable metadata attached to an empty/failed feed response.

Allows downstream consumers to classify the failure and decide whether to
retry the request, fall back to a non-feed endpoint, or skip entirely.

## Properties

### errorCode?

> `optional` **errorCode?**: [`FeedErrorCode`](../type-aliases/FeedErrorCode.md)

Defined in: [tools/shared/feedUtils.ts:116](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/feedUtils.ts#L116)

Machine-readable failure classification.

***

### retryable?

> `optional` **retryable?**: `boolean`

Defined in: [tools/shared/feedUtils.ts:118](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/feedUtils.ts#L118)

Whether the failure is transient and the request should be retried.

***

### retryAfterMs?

> `optional` **retryAfterMs?**: `number`

Defined in: [tools/shared/feedUtils.ts:126](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/feedUtils.ts#L126)

Suggested delay (in milliseconds) before retrying, when known.

Populated for `RATE_LIMIT` failures originating from the local
token-bucket limiter (where the wait time is precisely known) and may be
populated for upstream rate-limits when a `Retry-After` value is parsed.

***

### upstream?

> `optional` **upstream?**: `object`

Defined in: [tools/shared/feedUtils.ts:128](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/feedUtils.ts#L128)

Information about the upstream error, when available.

#### errorMessage?

> `optional` **errorMessage?**: `string`

Raw error message from the upstream response body.

#### statusCode?

> `optional` **statusCode?**: `number`

HTTP status code parsed from the upstream error message, if present.
