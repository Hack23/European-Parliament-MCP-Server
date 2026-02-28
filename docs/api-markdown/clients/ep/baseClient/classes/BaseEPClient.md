[**European Parliament MCP Server API v0.9.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/baseClient](../README.md) / BaseEPClient

# Class: BaseEPClient

Defined in: [clients/ep/baseClient.ts:125](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L125)

Base class for European Parliament API sub-clients.

Holds the shared HTTP machinery: LRU cache, token-bucket rate limiter,
timeout/abort controller, and retry logic.  Sub-clients extend this class
and call the protected `get()` helper for all HTTP requests.

 BaseEPClient

## Extended by

- [`CommitteeClient`](../../committeeClient/classes/CommitteeClient.md)
- [`DocumentClient`](../../documentClient/classes/DocumentClient.md)
- [`LegislativeClient`](../../legislativeClient/classes/LegislativeClient.md)
- [`MEPClient`](../../mepClient/classes/MEPClient.md)
- [`PlenaryClient`](../../plenaryClient/classes/PlenaryClient.md)
- [`QuestionClient`](../../questionClient/classes/QuestionClient.md)
- [`VocabularyClient`](../../vocabularyClient/classes/VocabularyClient.md)
- [`VotingClient`](../../votingClient/classes/VotingClient.md)

## Constructors

### Constructor

> **new BaseEPClient**(`config?`, `shared?`): `BaseEPClient`

Defined in: [clients/ep/baseClient.ts:149](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L149)

Creates a BaseEPClient.

When `shared` is provided the constructor reuses those pre-built resources
instead of allocating new ones; this is the mechanism used by the facade to
ensure all sub-clients share one cache and one rate-limiter.

#### Parameters

##### config?

`EPClientConfig` = `{}`

Client configuration (used when `shared` is absent)

##### shared?

`EPSharedResources`

Pre-built shared resources (passed by facade to sub-clients)

#### Returns

`BaseEPClient`

## Properties

### baseURL

> `protected` `readonly` **baseURL**: `string`

Defined in: [clients/ep/baseClient.ts:129](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L129)

European Parliament API base URL.

***

### cache

> `protected` `readonly` **cache**: `LRUCache`\<`string`, [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>

Defined in: [clients/ep/baseClient.ts:127](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L127)

LRU cache for API responses.

***

### enableRetry

> `protected` `readonly` **enableRetry**: `boolean`

Defined in: [clients/ep/baseClient.ts:135](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L135)

Enable automatic retry on transient failures.

***

### maxRetries

> `protected` `readonly` **maxRetries**: `number`

Defined in: [clients/ep/baseClient.ts:137](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L137)

Maximum number of retry attempts.

***

### rateLimiter

> `protected` `readonly` **rateLimiter**: [`RateLimiter`](../../../../utils/rateLimiter/classes/RateLimiter.md)

Defined in: [clients/ep/baseClient.ts:131](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L131)

Token bucket rate limiter.

***

### timeoutMs

> `protected` `readonly` **timeoutMs**: `number`

Defined in: [clients/ep/baseClient.ts:133](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L133)

Request timeout in milliseconds.

## Methods

### buildRequestUrl()

> `private` **buildRequestUrl**(`endpoint`, `params?`): `URL`

Defined in: [clients/ep/baseClient.ts:186](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L186)

Builds the full request URL from endpoint + optional params.

#### Parameters

##### endpoint

`string`

##### params?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

#### Returns

`URL`

***

### clearCache()

> **clearCache**(): `void`

Defined in: [clients/ep/baseClient.ts:419](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L419)

Clears all entries from the LRU cache.

#### Returns

`void`

***

### fetchWithRetry()

> `private` **fetchWithRetry**\<`T`\>(`url`, `endpoint`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [clients/ep/baseClient.ts:328](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L328)

Wraps a fetch call with the configured retry policy.

#### Type Parameters

##### T

`T`

#### Parameters

##### url

`URL`

##### endpoint

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

***

### fetchWithTimeout()

> `private` **fetchWithTimeout**\<`T`\>(`url`, `endpoint`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [clients/ep/baseClient.ts:280](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L280)

Executes the HTTP fetch with timeout/abort support and response size guard.

#### Type Parameters

##### T

`T`

#### Parameters

##### url

`URL`

##### endpoint

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

***

### get()

> `protected` **get**\<`T`\>(`endpoint`, `params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [clients/ep/baseClient.ts:368](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L368)

Executes a cached, rate-limited GET request to the EP API.

#### Type Parameters

##### T

`T` *extends* [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Expected response type (extends `Record<string, unknown>`)

#### Parameters

##### endpoint

`string`

API endpoint path (relative to `baseURL`)

##### params?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Optional query parameters

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Promise resolving to the typed API response

#### Throws

On HTTP errors, network failures, or parse failures

***

### getCacheKey()

> `private` **getCacheKey**(`endpoint`, `params?`): `string`

Defined in: [clients/ep/baseClient.ts:406](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L406)

Generates a deterministic cache key.

#### Parameters

##### endpoint

`string`

API endpoint path

##### params?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Optional query parameters

#### Returns

`string`

JSON string used as cache key

***

### getCacheStats()

> **getCacheStats**(): `object`

Defined in: [clients/ep/baseClient.ts:428](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L428)

Returns cache statistics for monitoring and debugging.

#### Returns

`object`

`{ size, maxSize, hitRate }`

##### hitRate

> **hitRate**: `number`

##### maxSize

> **maxSize**: `number`

##### size

> **size**: `number`

***

### readStreamedBody()

> `private` **readStreamedBody**\<`T`\>(`response`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [clients/ep/baseClient.ts:235](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L235)

Reads the response body as a stream, enforcing the response size cap.
Used as a fallback when the `content-length` header is absent (e.g. chunked
transfer encoding). Accumulates all chunks and parses the result as JSON.

#### Type Parameters

##### T

`T`

#### Parameters

##### response

`Response`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

***

### shouldRetryRequest()

> `private` **shouldRetryRequest**(`error`): `boolean`

Defined in: [clients/ep/baseClient.ts:220](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L220)

Returns true when an error should trigger a retry.

Retries on:
- 429 Too Many Requests (rate-limited by EP API; exponential backoff applied)
- 5xx Server Errors (transient server failures)
- Network / unknown errors

Does NOT retry on 4xx client errors (except 429).

#### Parameters

##### error

`unknown`

#### Returns

`boolean`

***

### toAPIError()

> `private` **toAPIError**(`error`, `endpoint`): [`APIError`](APIError.md)

Defined in: [clients/ep/baseClient.ts:343](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L343)

Converts a caught error to a typed [APIError](APIError.md).

#### Parameters

##### error

`unknown`

##### endpoint

`string`

#### Returns

[`APIError`](APIError.md)
