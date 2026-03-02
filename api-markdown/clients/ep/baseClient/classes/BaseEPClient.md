[**European Parliament MCP Server API v1.1.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/baseClient](../README.md) / BaseEPClient

# Class: BaseEPClient

Defined in: [clients/ep/baseClient.ts:213](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L213)

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

Defined in: [clients/ep/baseClient.ts:279](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L279)

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

Defined in: [clients/ep/baseClient.ts:217](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L217)

European Parliament API base URL.

***

### cache

> `protected` `readonly` **cache**: `LRUCache`\<`string`, [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>

Defined in: [clients/ep/baseClient.ts:215](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L215)

LRU cache for API responses.

***

### cacheCounters

> `private` `readonly` **cacheCounters**: `object`

Defined in: [clients/ep/baseClient.ts:229](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L229)

Shared cache hit/miss counters (shared via EPSharedResources when used as sub-client).

#### hits

> **hits**: `number`

#### misses

> **misses**: `number`

***

### enableRetry

> `protected` `readonly` **enableRetry**: `boolean`

Defined in: [clients/ep/baseClient.ts:223](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L223)

Enable automatic retry on transient failures.

***

### maxResponseBytes

> `protected` `readonly` **maxResponseBytes**: `number`

Defined in: [clients/ep/baseClient.ts:227](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L227)

Maximum allowed response body size in bytes.

***

### maxRetries

> `protected` `readonly` **maxRetries**: `number`

Defined in: [clients/ep/baseClient.ts:225](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L225)

Maximum number of retry attempts.

***

### rateLimiter

> `protected` `readonly` **rateLimiter**: [`RateLimiter`](../../../../utils/rateLimiter/classes/RateLimiter.md)

Defined in: [clients/ep/baseClient.ts:219](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L219)

Token bucket rate limiter.

***

### timeoutMs

> `protected` `readonly` **timeoutMs**: `number`

Defined in: [clients/ep/baseClient.ts:221](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L221)

Request timeout in milliseconds.

## Methods

### buildRequestUrl()

> `private` **buildRequestUrl**(`endpoint`, `params?`): `URL`

Defined in: [clients/ep/baseClient.ts:313](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L313)

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

Defined in: [clients/ep/baseClient.ts:613](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L613)

Clears all entries from the LRU cache.

#### Returns

`void`

***

### fetchWithRetry()

> `private` **fetchWithRetry**\<`T`\>(`url`, `endpoint`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [clients/ep/baseClient.ts:512](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L512)

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

Defined in: [clients/ep/baseClient.ts:451](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L451)

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

Defined in: [clients/ep/baseClient.ts:553](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L553)

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

Defined in: [clients/ep/baseClient.ts:600](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L600)

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

Defined in: [clients/ep/baseClient.ts:622](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L622)

Returns cache statistics for monitoring and debugging.

#### Returns

`object`

`{ size, maxSize, hitRate, hits, misses }`

##### hitRate

> **hitRate**: `number`

##### hits

> **hits**: `number`

##### maxSize

> **maxSize**: `number`

##### misses

> **misses**: `number`

##### size

> **size**: `number`

***

### readStreamedBody()

> `private` **readStreamedBody**\<`T`\>(`response`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [clients/ep/baseClient.ts:384](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L384)

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

Defined in: [clients/ep/baseClient.ts:347](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L347)

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

Defined in: [clients/ep/baseClient.ts:528](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L528)

Converts a caught error to a typed [APIError](APIError.md).

#### Parameters

##### error

`unknown`

##### endpoint

`string`

#### Returns

[`APIError`](APIError.md)

***

### parseJsonLdBytes()

> `private` `static` **parseJsonLdBytes**(`bytes`): `JSONLDResponse`

Defined in: [clients/ep/baseClient.ts:371](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L371)

Parses a byte buffer as JSON-LD.  Returns an empty JSON-LD shape for
zero-byte bodies (the EP API sends these for out-of-range offsets).
Non-empty bodies must contain valid JSON; any `SyntaxError` is allowed
to propagate so callers (including single-entity endpoints) fail fast
instead of receiving a misleading empty-list shape.

#### Parameters

##### bytes

[`Uint8Array`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)

#### Returns

`JSONLDResponse`

***

### parseResponseJson()

> `private` `static` **parseResponseJson**\<`T`\>(`response`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [clients/ep/baseClient.ts:430](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L430)

Treats a truly empty body as an empty JSON-LD shape; invalid JSON for
non-empty bodies is surfaced as an error.

#### Type Parameters

##### T

`T`

#### Parameters

##### response

`Response`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

***

### resolveConfig()

> `private` `static` **resolveConfig**(`config`): `object`

Defined in: [clients/ep/baseClient.ts:236](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L236)

Resolves all EPClientConfig options to their final values with defaults applied.
Extracted to keep constructor complexity within limits.

#### Parameters

##### config

`EPClientConfig`

#### Returns

`object`

##### baseURL

> **baseURL**: `string`

##### cacheTTL

> **cacheTTL**: `number`

##### enableRetry

> **enableRetry**: `boolean`

##### maxCacheSize

> **maxCacheSize**: `number`

##### maxResponseBytes

> **maxResponseBytes**: `number`

##### maxRetries

> **maxRetries**: `number`

##### rateLimiter

> **rateLimiter**: [`RateLimiter`](../../../../utils/rateLimiter/classes/RateLimiter.md)

##### timeoutMs

> **timeoutMs**: `number`
