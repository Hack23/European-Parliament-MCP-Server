[**European Parliament MCP Server API v1.2.16**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/baseClient](../README.md) / BaseEPClient

# Class: BaseEPClient

Defined in: [clients/ep/baseClient.ts:229](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L229)

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

Defined in: [clients/ep/baseClient.ts:295](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L295)

Creates a BaseEPClient.

When `shared` is provided the constructor reuses those pre-built resources
instead of allocating new ones; this is the mechanism used by the facade to
ensure all sub-clients share one cache and one rate-limiter.

#### Parameters

##### config?

[`EPClientConfig`](../interfaces/EPClientConfig.md) = `{}`

Client configuration (used when `shared` is absent)

##### shared?

[`EPSharedResources`](../interfaces/EPSharedResources.md)

Pre-built shared resources (passed by facade to sub-clients)

#### Returns

`BaseEPClient`

## Properties

### baseURL

> `protected` `readonly` **baseURL**: `string`

Defined in: [clients/ep/baseClient.ts:233](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L233)

European Parliament API base URL.

***

### cache

> `protected` `readonly` **cache**: `LRUCache`\<`string`, [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>

Defined in: [clients/ep/baseClient.ts:231](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L231)

LRU cache for API responses.

***

### cacheCounters

> `private` `readonly` **cacheCounters**: `object`

Defined in: [clients/ep/baseClient.ts:245](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L245)

Shared cache hit/miss counters (shared via EPSharedResources when used as sub-client).

#### hits

> **hits**: `number`

#### misses

> **misses**: `number`

***

### enableRetry

> `protected` `readonly` **enableRetry**: `boolean`

Defined in: [clients/ep/baseClient.ts:239](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L239)

Enable automatic retry on transient failures.

***

### maxResponseBytes

> `protected` `readonly` **maxResponseBytes**: `number`

Defined in: [clients/ep/baseClient.ts:243](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L243)

Maximum allowed response body size in bytes.

***

### maxRetries

> `protected` `readonly` **maxRetries**: `number`

Defined in: [clients/ep/baseClient.ts:241](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L241)

Maximum number of retry attempts.

***

### rateLimiter

> `protected` `readonly` **rateLimiter**: [`RateLimiter`](../../../../utils/rateLimiter/classes/RateLimiter.md)

Defined in: [clients/ep/baseClient.ts:235](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L235)

Token bucket rate limiter.

***

### timeoutMs

> `protected` `readonly` **timeoutMs**: `number`

Defined in: [clients/ep/baseClient.ts:237](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L237)

Request timeout in milliseconds.

***

### EMPTY\_JSONLD

> `private` `readonly` `static` **EMPTY\_JSONLD**: [`Readonly`](https://www.typescriptlang.org/docs/handbook/utility-types.html#readonlytype)\<\{ `@context`: `never`[]; `data`: `never`[]; \}\>

Defined in: [clients/ep/baseClient.ts:494](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L494)

Empty JSON-LD shape returned for bodyless responses (HTTP 204, content-length: 0).

## Methods

### buildRequestUrl()

> `private` **buildRequestUrl**(`endpoint`, `params?`): `URL`

Defined in: [clients/ep/baseClient.ts:329](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L329)

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

Defined in: [clients/ep/baseClient.ts:721](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L721)

Clears all entries from the LRU cache.

#### Returns

`void`

***

### evictFromCache()

> `protected` **evictFromCache**(`endpoint`, `params?`): `void`

Defined in: [clients/ep/baseClient.ts:736](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L736)

Evicts a single cache entry matching the given endpoint and params.
Sub-clients use this when they detect that a successfully-fetched payload
is a content-pending sentinel that must not be served from cache for the
remainder of the TTL — eviction lets availability recover as soon as the
upstream document is enriched.

#### Parameters

##### endpoint

`string`

API endpoint path (same value passed to [get](#get))

##### params?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Optional query parameters (same value passed to [get](#get))

#### Returns

`void`

***

### fetchWithRetry()

> `private` **fetchWithRetry**\<`T`\>(`url`, `endpoint`, `minimumTimeoutMs?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [clients/ep/baseClient.ts:597](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L597)

Wraps a fetch call with the configured retry policy.

#### Type Parameters

##### T

`T`

#### Parameters

##### url

`URL`

Fully resolved request URL

##### endpoint

`string`

Relative endpoint path (for error messages)

##### minimumTimeoutMs?

`number`

Optional per-request minimum timeout (ms)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

***

### fetchWithTimeout()

> `private` **fetchWithTimeout**\<`T`\>(`url`, `endpoint`, `minimumTimeoutMs?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [clients/ep/baseClient.ts:533](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L533)

Executes the HTTP fetch with timeout/abort support and response size guard.

#### Type Parameters

##### T

`T`

#### Parameters

##### url

`URL`

Fully resolved request URL

##### endpoint

`string`

Relative endpoint path (for error messages)

##### minimumTimeoutMs?

`number`

Optional per-request minimum timeout (ms).
  When provided, the effective timeout is `Math.max(minimumTimeoutMs, this.timeoutMs)`,
  so it acts as a floor that the global timeout can still extend.
  Use for known slow EP API endpoints (e.g. `procedures/feed`, `events/feed`).

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

***

### get()

> `protected` **get**\<`T`\>(`endpoint`, `params?`, `minimumTimeoutMs?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [clients/ep/baseClient.ts:653](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L653)

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

##### minimumTimeoutMs?

`number`

Optional per-request minimum timeout in milliseconds.
  When provided, the effective timeout is `Math.max(minimumTimeoutMs, this.timeoutMs)`,
  so the global timeout (set via `--timeout` or `EP_REQUEST_TIMEOUT_MS`) can still
  extend it beyond the per-endpoint minimum.
  Use for known slow EP API endpoints such as `procedures/feed` and `events/feed`.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Promise resolving to the typed API response

#### Throws

On HTTP errors, network failures, or parse failures

***

### getCacheKey()

> `private` **getCacheKey**(`endpoint`, `params?`): `string`

Defined in: [clients/ep/baseClient.ts:701](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L701)

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

Defined in: [clients/ep/baseClient.ts:745](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L745)

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

### parseByContentLength()

> `private` **parseByContentLength**\<`T`\>(`response`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T` \| `undefined`\>

Defined in: [clients/ep/baseClient.ts:502](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L502)

Parses the response body based on content-length header.
Returns `undefined` when content-length is absent or non-finite (caller
should fall through to streamed-body parsing).

#### Type Parameters

##### T

`T`

#### Parameters

##### response

`Response`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T` \| `undefined`\>

***

### readStreamedBody()

> `private` **readStreamedBody**\<`T`\>(`response`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [clients/ep/baseClient.ts:400](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L400)

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

Defined in: [clients/ep/baseClient.ts:363](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L363)

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

Defined in: [clients/ep/baseClient.ts:619](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L619)

Converts a caught error to a typed [APIError](APIError.md).
For timeout errors, the actual timeout value is read from the
[TimeoutError](../../../../utils/timeout/classes/TimeoutError.md) instance (which carries the effective value used
by `withTimeoutAndAbort`), avoiding the need to re-validate or
recompute the per-endpoint minimum here.

#### Parameters

##### error

`unknown`

The caught error

##### endpoint

`string`

Relative endpoint path (for error messages)

#### Returns

[`APIError`](APIError.md)

***

### parseJsonLdBytes()

> `private` `static` **parseJsonLdBytes**(`bytes`): [`JSONLDResponse`](../interfaces/JSONLDResponse.md)

Defined in: [clients/ep/baseClient.ts:387](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L387)

Parses a byte buffer as JSON-LD.  Returns an empty JSON-LD shape for
zero-byte bodies (the EP API sends these for out-of-range offsets).
Non-empty bodies must contain valid JSON; any `SyntaxError` is allowed
to propagate so callers (including single-entity endpoints) fail fast
instead of receiving a misleading empty-list shape.

#### Parameters

##### bytes

[`Uint8Array`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)

#### Returns

[`JSONLDResponse`](../interfaces/JSONLDResponse.md)

***

### parseResponseJson()

> `private` `static` **parseResponseJson**\<`T`\>(`response`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [clients/ep/baseClient.ts:446](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L446)

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

Defined in: [clients/ep/baseClient.ts:252](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L252)

Resolves all EPClientConfig options to their final values with defaults applied.
Extracted to keep constructor complexity within limits.

#### Parameters

##### config

[`EPClientConfig`](../interfaces/EPClientConfig.md)

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

***

### validateContentType()

> `private` `static` **validateContentType**(`response`): `void`

Defined in: [clients/ep/baseClient.ts:473](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L473)

Validates the Content-Type header of an API response.
Throws if the response is not JSON (e.g. HTML error pages from reverse proxies).
Cancels the response body before throwing to allow connection reuse.

A missing or empty Content-Type header is treated as acceptable because
the EP API occasionally omits it on valid JSON responses, and rejecting
those would cause false-negative failures.

#### Parameters

##### response

`Response`

#### Returns

`void`
