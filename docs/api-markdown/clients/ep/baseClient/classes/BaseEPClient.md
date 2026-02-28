[**European Parliament MCP Server API v1.0.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/baseClient](../README.md) / BaseEPClient

# Class: BaseEPClient

Defined in: [clients/ep/baseClient.ts:126](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L126)

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

Defined in: [clients/ep/baseClient.ts:150](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L150)

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

Defined in: [clients/ep/baseClient.ts:130](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L130)

European Parliament API base URL.

***

### cache

> `protected` `readonly` **cache**: `LRUCache`\<`string`, [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>

Defined in: [clients/ep/baseClient.ts:128](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L128)

LRU cache for API responses.

***

### enableRetry

> `protected` `readonly` **enableRetry**: `boolean`

Defined in: [clients/ep/baseClient.ts:136](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L136)

Enable automatic retry on transient failures.

***

### maxRetries

> `protected` `readonly` **maxRetries**: `number`

Defined in: [clients/ep/baseClient.ts:138](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L138)

Maximum number of retry attempts.

***

### rateLimiter

> `protected` `readonly` **rateLimiter**: [`RateLimiter`](../../../../utils/rateLimiter/classes/RateLimiter.md)

Defined in: [clients/ep/baseClient.ts:132](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L132)

Token bucket rate limiter.

***

### timeoutMs

> `protected` `readonly` **timeoutMs**: `number`

Defined in: [clients/ep/baseClient.ts:134](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L134)

Request timeout in milliseconds.

## Methods

### buildRequestUrl()

> `private` **buildRequestUrl**(`endpoint`, `params?`): `URL`

Defined in: [clients/ep/baseClient.ts:187](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L187)

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

Defined in: [clients/ep/baseClient.ts:427](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L427)

Clears all entries from the LRU cache.

#### Returns

`void`

***

### fetchWithRetry()

> `private` **fetchWithRetry**\<`T`\>(`url`, `endpoint`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [clients/ep/baseClient.ts:329](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L329)

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

Defined in: [clients/ep/baseClient.ts:281](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L281)

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

Defined in: [clients/ep/baseClient.ts:369](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L369)

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

Defined in: [clients/ep/baseClient.ts:414](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L414)

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

Defined in: [clients/ep/baseClient.ts:436](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L436)

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

Defined in: [clients/ep/baseClient.ts:236](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L236)

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

Defined in: [clients/ep/baseClient.ts:221](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L221)

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

Defined in: [clients/ep/baseClient.ts:344](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L344)

Converts a caught error to a typed [APIError](APIError.md).

#### Parameters

##### error

`unknown`

##### endpoint

`string`

#### Returns

[`APIError`](APIError.md)
