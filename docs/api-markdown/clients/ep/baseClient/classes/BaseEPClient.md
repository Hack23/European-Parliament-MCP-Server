[**European Parliament MCP Server API v1.3.25**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/baseClient](../README.md) / BaseEPClient

# Class: BaseEPClient

Defined in: [clients/ep/baseClient.ts:215](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L215)

Base class for European Parliament API sub-clients.

Holds the shared HTTP machinery: LRU cache, token-bucket rate limiter,
timeout/abort controller, and retry logic.  Sub-clients extend this class
and call the protected `get()` helper for all HTTP requests.

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

Defined in: [clients/ep/baseClient.ts:278](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L278)

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

Defined in: [clients/ep/baseClient.ts:219](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L219)

European Parliament API base URL.

***

### cache

> `protected` `readonly` **cache**: `LRUCache`\<`string`, [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>

Defined in: [clients/ep/baseClient.ts:217](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L217)

LRU cache for API responses.

***

### cacheCounters

> `private` `readonly` **cacheCounters**: `object`

Defined in: [clients/ep/baseClient.ts:231](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L231)

Shared cache hit/miss counters (shared via EPSharedResources when used as sub-client).

#### hits

> **hits**: `number`

#### misses

> **misses**: `number`

***

### enableRetry

> `protected` `readonly` **enableRetry**: `boolean`

Defined in: [clients/ep/baseClient.ts:225](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L225)

Enable automatic retry on transient failures.

***

### maxResponseBytes

> `protected` `readonly` **maxResponseBytes**: `number`

Defined in: [clients/ep/baseClient.ts:229](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L229)

Maximum allowed response body size in bytes.

***

### maxRetries

> `protected` `readonly` **maxRetries**: `number`

Defined in: [clients/ep/baseClient.ts:227](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L227)

Maximum number of retry attempts.

***

### rateLimiter

> `protected` `readonly` **rateLimiter**: [`RateLimiter`](../../../../utils/rateLimiter/classes/RateLimiter.md)

Defined in: [clients/ep/baseClient.ts:221](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L221)

Token bucket rate limiter.

***

### timeoutMs

> `protected` `readonly` **timeoutMs**: `number`

Defined in: [clients/ep/baseClient.ts:223](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L223)

Request timeout in milliseconds.

***

### EMPTY\_JSONLD

> `private` `readonly` `static` **EMPTY\_JSONLD**: [`Readonly`](https://www.typescriptlang.org/docs/handbook/utility-types.html#readonlytype)\<\{ `@context`: `never`[]; `data`: `never`[]; \}\>

Defined in: [clients/ep/baseClient.ts:466](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L466)

Empty JSON-LD shape returned for bodyless responses (HTTP 204, content-length: 0).

#### Private

## Methods

### buildRequestUrl()

> `private` **buildRequestUrl**(`endpoint`, `params?`): `URL`

Defined in: [clients/ep/baseClient.ts:310](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L310)

Builds the full request URL from endpoint + optional params.

#### Parameters

##### endpoint

`string`

##### params?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

#### Returns

`URL`

#### Private

***

### clearCache()

> **clearCache**(): `void`

Defined in: [clients/ep/baseClient.ts:768](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L768)

Clears all entries from the LRU cache.

#### Returns

`void`

***

### effectiveTimeoutMs()

> `private` **effectiveTimeoutMs**(`minimumTimeoutMs?`): `number`

Defined in: [clients/ep/baseClient.ts:499](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L499)

Computes the effective per-request timeout, honouring an optional floor.

#### Parameters

##### minimumTimeoutMs?

`number`

#### Returns

`number`

#### Private

***

### evictFromCache()

> `protected` **evictFromCache**(`endpoint`, `params?`): `void`

Defined in: [clients/ep/baseClient.ts:783](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L783)

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

#### Protected

***

### fetchWithRetry()

> `private` **fetchWithRetry**\<`T`\>(`url`, `endpoint`, `minimumTimeoutMs?`, `externalSignal?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [clients/ep/baseClient.ts:600](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L600)

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

##### externalSignal?

`AbortSignal`

Optional caller-provided cancellation signal

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

#### Private

***

### fetchWithTimeout()

> `private` **fetchWithTimeout**\<`T`\>(`url`, `endpoint`, `minimumTimeoutMs?`, `externalSignal?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [clients/ep/baseClient.ts:562](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L562)

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
  Use for known slow EP API endpoints (e.g. `procedures/feed`).

##### externalSignal?

`AbortSignal`

Optional caller-provided cancellation signal.
  When this signal fires mid-flight, the underlying fetch is aborted and
  [toAPIError](#toapierror) converts the cancellation to an `APIError` with
  `statusCode: 0` (distinct from the timeout-driven 408 path).

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

#### Private

***

### get()

> `protected` **get**\<`T`\>(`endpoint`, `params?`, `minimumTimeoutMs?`, `abortSignal?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [clients/ep/baseClient.ts:685](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L685)

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
  Use for known slow EP API endpoints such as `procedures/feed`.

##### abortSignal?

`AbortSignal`

Optional caller-provided cancellation signal. When
  already aborted on entry the request is rejected immediately *before*
  consuming a rate-limiter token (so a cancelled fan-out does not starve
  the bucket). When aborted mid-flight, the underlying fetch is
  cancelled and the rejection is surfaced as `APIError(..., 0, { cause })`.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Promise resolving to the typed API response

#### Throws

On HTTP errors, network failures, parse failures, or
  cancellation (statusCode 0). Aborts are NOT retried.

#### Protected

***

### getCacheKey()

> `private` **getCacheKey**(`endpoint`, `params?`): `string`

Defined in: [clients/ep/baseClient.ts:754](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L754)

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

#### Private

***

### getCacheStats()

> **getCacheStats**(): `object`

Defined in: [clients/ep/baseClient.ts:792](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L792)

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

### issueRequest()

> `private` **issueRequest**\<`T`\>(`url`, `linkedSignal`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [clients/ep/baseClient.ts:516](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L516)

Issues a single HTTP fetch under the linked-abort controller and
processes the response (status, content-type, size, body).

#### Type Parameters

##### T

`T`

#### Parameters

##### url

`URL`

##### linkedSignal

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

#### Private

***

### parseByContentLength()

> `private` **parseByContentLength**\<`T`\>(`response`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T` \| `undefined`\>

Defined in: [clients/ep/baseClient.ts:474](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L474)

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

#### Private

***

### readStreamedBody()

> `private` **readStreamedBody**\<`T`\>(`response`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [clients/ep/baseClient.ts:379](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L379)

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

#### Private

***

### shouldRetryRequest()

> `private` **shouldRetryRequest**(`error`): `boolean`

Defined in: [clients/ep/baseClient.ts:345](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L345)

Returns true when an error should trigger a retry.

Retries on:
- 429 Too Many Requests (rate-limited by EP API; exponential backoff applied)
- 5xx Server Errors (transient server failures)
- Network / unknown errors

Does NOT retry on 4xx client errors (except 429), nor on cancellation
(statusCode 0 — an aborted request must never be re-issued).

#### Parameters

##### error

`unknown`

#### Returns

`boolean`

#### Private

***

### toAPIError()

> `private` **toAPIError**(`error`, `endpoint`, `externalSignal?`): [`APIError`](APIError.md)

Defined in: [clients/ep/baseClient.ts:636](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L636)

Converts a caught error to a typed [APIError](APIError.md).

- `TimeoutError` → `APIError(..., 408)` (the internal per-request
  timeout fired before the response completed).
- Cancellation triggered by an *external* `AbortSignal` →
  `APIError(..., 0, { cause: <signal.reason> })`. Status 0 is distinct
  from the timeout (408) and rate-limit (429) paths so callers can
  distinguish budget cancellations from upstream failures and skip
  retries via [shouldRetryRequest](#shouldretryrequest).

#### Parameters

##### error

`unknown`

The caught error

##### endpoint

`string`

Relative endpoint path (for error messages)

##### externalSignal?

`AbortSignal`

The caller-provided signal (if any). When the
  signal is already aborted at the time of catch, the error is treated
  as a cancellation regardless of its concrete shape (some runtimes
  surface a generic `AbortError` rather than re-throwing `signal.reason`).

#### Returns

[`APIError`](APIError.md)

#### Private

***

### parseJsonLdBytes()

> `private` `static` **parseJsonLdBytes**(`bytes`): [`JSONLDResponse`](../interfaces/JSONLDResponse.md)

Defined in: [clients/ep/baseClient.ts:366](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L366)

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

#### Private

***

### parseResponseJson()

> `private` `static` **parseResponseJson**\<`T`\>(`response`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [clients/ep/baseClient.ts:425](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L425)

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

#### Private

***

### resolveConfig()

> `private` `static` **resolveConfig**(`config`): `object`

Defined in: [clients/ep/baseClient.ts:238](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L238)

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

#### Private

***

### validateContentType()

> `private` `static` **validateContentType**(`response`): `void`

Defined in: [clients/ep/baseClient.ts:445](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L445)

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

#### Private
