[**European Parliament MCP Server API v1.3.41**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/legislativeClient](../README.md) / LegislativeClient

# Class: LegislativeClient

Defined in: [clients/ep/legislativeClient.ts:35](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/legislativeClient.ts#L35)

Sub-client for legislative procedures and adopted-texts EP API endpoints.

## Extends

- [`BaseEPClient`](../../baseClient/classes/BaseEPClient.md)

## Constructors

### Constructor

> **new LegislativeClient**(`config?`, `shared?`): `LegislativeClient`

Defined in: [clients/ep/legislativeClient.ts:36](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/legislativeClient.ts#L36)

#### Parameters

##### config?

[`EPClientConfig`](../../baseClient/interfaces/EPClientConfig.md) = `{}`

##### shared?

[`EPSharedResources`](../../baseClient/interfaces/EPSharedResources.md)

#### Returns

`LegislativeClient`

#### Overrides

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`constructor`](../../baseClient/classes/BaseEPClient.md#constructor)

## Properties

### baseURL

> `protected` `readonly` **baseURL**: `string`

Defined in: [clients/ep/baseClient.ts:219](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L219)

European Parliament API base URL.

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`baseURL`](../../baseClient/classes/BaseEPClient.md#baseurl)

***

### cache

> `protected` `readonly` **cache**: `LRUCache`\<`string`, `Record`\<`string`, `unknown`\>\>

Defined in: [clients/ep/baseClient.ts:217](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L217)

LRU cache for API responses.

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`cache`](../../baseClient/classes/BaseEPClient.md#cache)

***

### enableRetry

> `protected` `readonly` **enableRetry**: `boolean`

Defined in: [clients/ep/baseClient.ts:225](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L225)

Enable automatic retry on transient failures.

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`enableRetry`](../../baseClient/classes/BaseEPClient.md#enableretry)

***

### maxResponseBytes

> `protected` `readonly` **maxResponseBytes**: `number`

Defined in: [clients/ep/baseClient.ts:229](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L229)

Maximum allowed response body size in bytes.

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`maxResponseBytes`](../../baseClient/classes/BaseEPClient.md#maxresponsebytes)

***

### maxRetries

> `protected` `readonly` **maxRetries**: `number`

Defined in: [clients/ep/baseClient.ts:227](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L227)

Maximum number of retry attempts.

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`maxRetries`](../../baseClient/classes/BaseEPClient.md#maxretries)

***

### rateLimiter

> `protected` `readonly` **rateLimiter**: [`RateLimiter`](../../../../utils/rateLimiter/classes/RateLimiter.md)

Defined in: [clients/ep/baseClient.ts:221](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L221)

Token bucket rate limiter.

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`rateLimiter`](../../baseClient/classes/BaseEPClient.md#ratelimiter)

***

### timeoutMs

> `protected` `readonly` **timeoutMs**: `number`

Defined in: [clients/ep/baseClient.ts:223](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L223)

Request timeout in milliseconds.

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`timeoutMs`](../../baseClient/classes/BaseEPClient.md#timeoutms)

## Methods

### clearCache()

> **clearCache**(): `void`

Defined in: [clients/ep/baseClient.ts:768](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L768)

Clears all entries from the LRU cache.

#### Returns

`void`

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`clearCache`](../../baseClient/classes/BaseEPClient.md#clearcache)

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

API endpoint path (same value passed to [get](../../baseClient/classes/BaseEPClient.md#get))

##### params?

`Record`\<`string`, `unknown`\>

Optional query parameters (same value passed to [get](../../baseClient/classes/BaseEPClient.md#get))

#### Returns

`void`

#### Protected

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`evictFromCache`](../../baseClient/classes/BaseEPClient.md#evictfromcache)

***

### get()

> `protected` **get**\<`T`\>(`endpoint`, `params?`, `minimumTimeoutMs?`, `abortSignal?`): `Promise`\<`T`\>

Defined in: [clients/ep/baseClient.ts:685](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L685)

Executes a cached, rate-limited GET request to the EP API.

#### Type Parameters

##### T

`T` *extends* `Record`\<`string`, `unknown`\>

Expected response type (extends `Record<string, unknown>`)

#### Parameters

##### endpoint

`string`

API endpoint path (relative to `baseURL`)

##### params?

`Record`\<`string`, `unknown`\>

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

`Promise`\<`T`\>

Promise resolving to the typed API response

#### Throws

On HTTP errors, network failures, parse failures, or
  cancellation (statusCode 0). Aborts are NOT retried.

#### Protected

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`get`](../../baseClient/classes/BaseEPClient.md#get)

***

### getAdoptedTextById()

> **getAdoptedTextById**(`docId`, `options?`): `Promise`\<[`AdoptedText`](../../../../types/ep/activities/interfaces/AdoptedText.md)\>

Defined in: [clients/ep/legislativeClient.ts:276](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/legislativeClient.ts#L276)

Returns a single adopted text by document ID.
**EP API Endpoint:** `GET /adopted-texts/{doc-id}`

**Content-pending detection:** The EP Open Data Portal will sometimes respond
with HTTP 200 for a document that is indexed in the feed but whose detail
enrichment has not yet completed — every transformable field comes back empty.
Returning that shape to callers would emit a response that passes JSON-schema
validation but carries no data, leading to blank titles/dates/references being
rendered downstream. We treat this sentinel as a 404 so callers get the same
error semantics they would for a truly missing document, and we also evict
the cached empty payload so availability recovers as soon as the upstream
document is enriched (instead of blocking for the full cache TTL).

#### Parameters

##### docId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`AdoptedText`](../../../../types/ep/activities/interfaces/AdoptedText.md)\>

#### Throws

400 when `docId` is empty or whitespace.

#### Throws

404 in two cases:
  - the upstream returns HTTP 404 because no document exists for `docId`
    (re-thrown by [BaseEPClient.get](../../baseClient/classes/BaseEPClient.md#get)); or
  - the upstream returns HTTP 200 but every transformable field is empty
    (the indexed-but-content-pending sentinel detected here).

***

### getAdoptedTexts()

> **getAdoptedTexts**(`params?`): `Promise`\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`AdoptedText`](../../../../types/ep/activities/interfaces/AdoptedText.md)\>\>

Defined in: [clients/ep/legislativeClient.ts:150](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/legislativeClient.ts#L150)

Returns adopted texts.
**EP API Endpoint:** `GET /adopted-texts`

#### Parameters

##### params?

year, limit, offset

###### abortSignal?

`AbortSignal`

###### limit?

`number`

###### offset?

`number`

###### year?

`number`

#### Returns

`Promise`\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`AdoptedText`](../../../../types/ep/activities/interfaces/AdoptedText.md)\>\>

***

### getAdoptedTextsFeed()

> **getAdoptedTextsFeed**(`params?`): `Promise`\<[`JSONLDResponse`](../../baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

Defined in: [clients/ep/legislativeClient.ts:201](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/legislativeClient.ts#L201)

Retrieves recently updated adopted texts via the feed endpoint.
**EP API Endpoint:** `GET /adopted-texts/feed`

Configurable-window feed.  Extended timeout applied for `one-month`.

#### Parameters

##### params?

###### abortSignal?

`AbortSignal`

###### startDate?

`string`

###### timeframe?

`string`

###### workType?

`string`

#### Returns

`Promise`\<[`JSONLDResponse`](../../baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

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

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`getCacheStats`](../../baseClient/classes/BaseEPClient.md#getcachestats)

***

### getProcedureById()

> **getProcedureById**(`processId`, `options?`): `Promise`\<[`Procedure`](../../../../types/ep/activities/interfaces/Procedure.md)\>

Defined in: [clients/ep/legislativeClient.ts:97](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/legislativeClient.ts#L97)

Returns a single procedure by ID.

The EP API wraps single-item responses in a JSON-LD `data` array,
so this method extracts `data[0]` before transforming.

**EP API Endpoint:** `GET /procedures/{process-id}`

#### Parameters

##### processId

`string`

Procedure **process-id** in `"YYYY-NNNN"` format (e.g. `"2024-0006"`).
  This is different from the human-readable `Procedure.id` (`"COD/YYYY/NNNN"`) or
  `Procedure.reference` (`"YYYY/NNNN(COD)"`) fields.

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`Procedure`](../../../../types/ep/activities/interfaces/Procedure.md)\>

#### Throws

When the procedure is not found (404)

***

### getProcedureEventById()

> **getProcedureEventById**(`processId`, `eventId`, `options?`): `Promise`\<[`EPEvent`](../../../../types/ep/activities/interfaces/EPEvent.md)\>

Defined in: [clients/ep/legislativeClient.ts:225](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/legislativeClient.ts#L225)

Returns a single event within a procedure by event ID.
**EP API Endpoint:** `GET /procedures/{process-id}/events/{event-id}`

#### Parameters

##### processId

`string`

Procedure process ID

##### eventId

`string`

Event identifier within the procedure

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`EPEvent`](../../../../types/ep/activities/interfaces/EPEvent.md)\>

***

### getProcedureEvents()

> **getProcedureEvents**(`processId`, `params?`): `Promise`\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`EPEvent`](../../../../types/ep/activities/interfaces/EPEvent.md)\>\>

Defined in: [clients/ep/legislativeClient.ts:121](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/legislativeClient.ts#L121)

Returns events linked to a procedure.
**EP API Endpoint:** `GET /procedures/{process-id}/events`

#### Parameters

##### processId

`string`

Procedure process ID

##### params?

limit, offset

###### abortSignal?

`AbortSignal`

###### limit?

`number`

###### offset?

`number`

#### Returns

`Promise`\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`EPEvent`](../../../../types/ep/activities/interfaces/EPEvent.md)\>\>

***

### getProcedures()

> **getProcedures**(`params?`): `Promise`\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Procedure`](../../../../types/ep/activities/interfaces/Procedure.md)\>\>

Defined in: [clients/ep/legislativeClient.ts:64](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/legislativeClient.ts#L64)

Returns legislative procedures.
**EP API Endpoint:** `GET /procedures`

**Note:** The EP API `/procedures` endpoint does **not** support a
`year` query parameter per the OpenAPI spec — it only has
`process-type`.  Callers needing year-specific counts must filter
client-side.

#### Parameters

##### params?

limit, offset

###### abortSignal?

`AbortSignal`

###### limit?

`number`

###### offset?

`number`

#### Returns

`Promise`\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Procedure`](../../../../types/ep/activities/interfaces/Procedure.md)\>\>

Paginated list of procedures

***

### getProceduresFeed()

> **getProceduresFeed**(`params?`): `Promise`\<[`JSONLDResponse`](../../baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

Defined in: [clients/ep/legislativeClient.ts:181](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/legislativeClient.ts#L181)

Retrieves recently updated procedures via the feed endpoint.
**EP API Endpoint:** `GET /procedures/feed`

**Note:** The EP API `procedures/feed` endpoint is significantly slower
than other feed endpoints — it typically takes 25–40 s even for `one-week`
and 120+ seconds for `one-month`.  An extended minimum timeout of 120 s
is always applied.

#### Parameters

##### params?

###### abortSignal?

`AbortSignal`

###### processType?

`string`

###### startDate?

`string`

###### timeframe?

`string`

#### Returns

`Promise`\<[`JSONLDResponse`](../../baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

***

### transformAdoptedText()

> `private` **transformAdoptedText**(`apiData`): [`AdoptedText`](../../../../types/ep/activities/interfaces/AdoptedText.md)

Defined in: [clients/ep/legislativeClient.ts:44](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/legislativeClient.ts#L44)

#### Parameters

##### apiData

`Record`\<`string`, `unknown`\>

#### Returns

[`AdoptedText`](../../../../types/ep/activities/interfaces/AdoptedText.md)

***

### transformEvent()

> `private` **transformEvent**(`apiData`): [`EPEvent`](../../../../types/ep/activities/interfaces/EPEvent.md)

Defined in: [clients/ep/legislativeClient.ts:48](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/legislativeClient.ts#L48)

#### Parameters

##### apiData

`Record`\<`string`, `unknown`\>

#### Returns

[`EPEvent`](../../../../types/ep/activities/interfaces/EPEvent.md)

***

### transformProcedure()

> `private` **transformProcedure**(`apiData`): [`Procedure`](../../../../types/ep/activities/interfaces/Procedure.md)

Defined in: [clients/ep/legislativeClient.ts:40](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/legislativeClient.ts#L40)

#### Parameters

##### apiData

`Record`\<`string`, `unknown`\>

#### Returns

[`Procedure`](../../../../types/ep/activities/interfaces/Procedure.md)
