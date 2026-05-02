[**European Parliament MCP Server API v1.2.20**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/legislativeClient](../README.md) / LegislativeClient

# Class: LegislativeClient

Defined in: [clients/ep/legislativeClient.ts:37](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/legislativeClient.ts#L37)

Sub-client for legislative procedures and adopted-texts EP API endpoints.

## Extends

- [`BaseEPClient`](../../baseClient/classes/BaseEPClient.md)

## Constructors

### Constructor

> **new LegislativeClient**(`config?`, `shared?`): `LegislativeClient`

Defined in: [clients/ep/legislativeClient.ts:38](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/legislativeClient.ts#L38)

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

Defined in: [clients/ep/baseClient.ts:233](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L233)

European Parliament API base URL.

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`baseURL`](../../baseClient/classes/BaseEPClient.md#baseurl)

***

### cache

> `protected` `readonly` **cache**: `LRUCache`\<`string`, [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>

Defined in: [clients/ep/baseClient.ts:231](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L231)

LRU cache for API responses.

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`cache`](../../baseClient/classes/BaseEPClient.md#cache)

***

### enableRetry

> `protected` `readonly` **enableRetry**: `boolean`

Defined in: [clients/ep/baseClient.ts:239](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L239)

Enable automatic retry on transient failures.

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`enableRetry`](../../baseClient/classes/BaseEPClient.md#enableretry)

***

### maxResponseBytes

> `protected` `readonly` **maxResponseBytes**: `number`

Defined in: [clients/ep/baseClient.ts:243](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L243)

Maximum allowed response body size in bytes.

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`maxResponseBytes`](../../baseClient/classes/BaseEPClient.md#maxresponsebytes)

***

### maxRetries

> `protected` `readonly` **maxRetries**: `number`

Defined in: [clients/ep/baseClient.ts:241](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L241)

Maximum number of retry attempts.

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`maxRetries`](../../baseClient/classes/BaseEPClient.md#maxretries)

***

### rateLimiter

> `protected` `readonly` **rateLimiter**: [`RateLimiter`](../../../../utils/rateLimiter/classes/RateLimiter.md)

Defined in: [clients/ep/baseClient.ts:235](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L235)

Token bucket rate limiter.

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`rateLimiter`](../../baseClient/classes/BaseEPClient.md#ratelimiter)

***

### timeoutMs

> `protected` `readonly` **timeoutMs**: `number`

Defined in: [clients/ep/baseClient.ts:237](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L237)

Request timeout in milliseconds.

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`timeoutMs`](../../baseClient/classes/BaseEPClient.md#timeoutms)

## Methods

### clearCache()

> **clearCache**(): `void`

Defined in: [clients/ep/baseClient.ts:721](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L721)

Clears all entries from the LRU cache.

#### Returns

`void`

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`clearCache`](../../baseClient/classes/BaseEPClient.md#clearcache)

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

API endpoint path (same value passed to [get](../../baseClient/classes/BaseEPClient.md#get))

##### params?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Optional query parameters (same value passed to [get](../../baseClient/classes/BaseEPClient.md#get))

#### Returns

`void`

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`evictFromCache`](../../baseClient/classes/BaseEPClient.md#evictfromcache)

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

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`get`](../../baseClient/classes/BaseEPClient.md#get)

***

### getAdoptedTextById()

> **getAdoptedTextById**(`docId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`AdoptedText`](../../../../types/ep/activities/interfaces/AdoptedText.md)\>

Defined in: [clients/ep/legislativeClient.ts:273](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/legislativeClient.ts#L273)

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

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`AdoptedText`](../../../../types/ep/activities/interfaces/AdoptedText.md)\>

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

> **getAdoptedTexts**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`AdoptedText`](../../../../types/ep/activities/interfaces/AdoptedText.md)\>\>

Defined in: [clients/ep/legislativeClient.ts:153](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/legislativeClient.ts#L153)

Returns adopted texts.
**EP API Endpoint:** `GET /adopted-texts`

#### Parameters

##### params?

year, limit, offset

###### limit?

`number`

###### offset?

`number`

###### year?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`AdoptedText`](../../../../types/ep/activities/interfaces/AdoptedText.md)\>\>

***

### getAdoptedTextsFeed()

> **getAdoptedTextsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/ep/legislativeClient.ts:202](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/legislativeClient.ts#L202)

Retrieves recently updated adopted texts via the feed endpoint.
**EP API Endpoint:** `GET /adopted-texts/feed`

Configurable-window feed.  Extended timeout applied for `one-month`.

#### Parameters

##### params?

###### startDate?

`string`

###### timeframe?

`string`

###### workType?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

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

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`getCacheStats`](../../baseClient/classes/BaseEPClient.md#getcachestats)

***

### getProcedureById()

> **getProcedureById**(`processId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Procedure`](../../../../types/ep/activities/interfaces/Procedure.md)\>

Defined in: [clients/ep/legislativeClient.ts:104](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/legislativeClient.ts#L104)

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

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Procedure`](../../../../types/ep/activities/interfaces/Procedure.md)\>

#### Throws

When the procedure is not found (404)

***

### getProcedureEventById()

> **getProcedureEventById**(`processId`, `eventId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`EPEvent`](../../../../types/ep/activities/interfaces/EPEvent.md)\>

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

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`EPEvent`](../../../../types/ep/activities/interfaces/EPEvent.md)\>

***

### getProcedureEvents()

> **getProcedureEvents**(`processId`, `params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`EPEvent`](../../../../types/ep/activities/interfaces/EPEvent.md)\>\>

Defined in: [clients/ep/legislativeClient.ts:126](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/legislativeClient.ts#L126)

Returns events linked to a procedure.
**EP API Endpoint:** `GET /procedures/{process-id}/events`

#### Parameters

##### processId

`string`

Procedure process ID

##### params?

limit, offset

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`EPEvent`](../../../../types/ep/activities/interfaces/EPEvent.md)\>\>

***

### getProcedures()

> **getProcedures**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Procedure`](../../../../types/ep/activities/interfaces/Procedure.md)\>\>

Defined in: [clients/ep/legislativeClient.ts:70](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/legislativeClient.ts#L70)

Returns legislative procedures.
**EP API Endpoint:** `GET /procedures`

**Note:** The EP API `/procedures` endpoint does **not** support a
`year` query parameter per the OpenAPI spec — it only has
`process-type`.  Callers needing year-specific counts must filter
client-side.

#### Parameters

##### params?

limit, offset

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Procedure`](../../../../types/ep/activities/interfaces/Procedure.md)\>\>

Paginated list of procedures

***

### getProceduresFeed()

> **getProceduresFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/ep/legislativeClient.ts:183](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/legislativeClient.ts#L183)

Retrieves recently updated procedures via the feed endpoint.
**EP API Endpoint:** `GET /procedures/feed`

**Note:** The EP API `procedures/feed` endpoint is significantly slower
than other feed endpoints — it typically takes 25–40 s even for `one-week`
and 120+ seconds for `one-month`.  An extended minimum timeout of 120 s
is always applied.

#### Parameters

##### params?

###### processType?

`string`

###### startDate?

`string`

###### timeframe?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### transformAdoptedText()

> `private` **transformAdoptedText**(`apiData`): [`AdoptedText`](../../../../types/ep/activities/interfaces/AdoptedText.md)

Defined in: [clients/ep/legislativeClient.ts:48](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/legislativeClient.ts#L48)

#### Parameters

##### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

#### Returns

[`AdoptedText`](../../../../types/ep/activities/interfaces/AdoptedText.md)

***

### transformEvent()

> `private` **transformEvent**(`apiData`): [`EPEvent`](../../../../types/ep/activities/interfaces/EPEvent.md)

Defined in: [clients/ep/legislativeClient.ts:52](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/legislativeClient.ts#L52)

#### Parameters

##### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

#### Returns

[`EPEvent`](../../../../types/ep/activities/interfaces/EPEvent.md)

***

### transformProcedure()

> `private` **transformProcedure**(`apiData`): [`Procedure`](../../../../types/ep/activities/interfaces/Procedure.md)

Defined in: [clients/ep/legislativeClient.ts:44](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/legislativeClient.ts#L44)

#### Parameters

##### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

#### Returns

[`Procedure`](../../../../types/ep/activities/interfaces/Procedure.md)
