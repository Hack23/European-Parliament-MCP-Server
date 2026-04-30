[**European Parliament MCP Server API v1.2.18**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/plenaryClient](../README.md) / PlenaryClient

# Class: PlenaryClient

Defined in: [clients/ep/plenaryClient.ts:41](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/plenaryClient.ts#L41)

Sub-client for plenary sessions and meeting-related EP API endpoints.

## Extends

- [`BaseEPClient`](../../baseClient/classes/BaseEPClient.md)

## Constructors

### Constructor

> **new PlenaryClient**(`config?`, `shared?`): `PlenaryClient`

Defined in: [clients/ep/plenaryClient.ts:42](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/plenaryClient.ts#L42)

#### Parameters

##### config?

[`EPClientConfig`](../../baseClient/interfaces/EPClientConfig.md) = `{}`

##### shared?

[`EPSharedResources`](../../baseClient/interfaces/EPSharedResources.md)

#### Returns

`PlenaryClient`

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

### buildMeetingsAPIParams()

> `private` **buildMeetingsAPIParams**(`params`): [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Defined in: [clients/ep/plenaryClient.ts:74](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/plenaryClient.ts#L74)

Maps internal params to EP API query parameters for meetings.

The EP API `/meetings` endpoint supports `year` for filtering by
calendar year.  The `date-from` / `date-to` parameters are also
forwarded when present (useful for sub-year ranges).

#### Parameters

##### params

###### dateFrom?

`string`

###### dateTo?

`string`

###### limit?

`number`

###### offset?

`number`

###### year?

`number`

#### Returns

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

***

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

### getEventById()

> **getEventById**(`eventId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`EPEvent`](../../../../types/ep/activities/interfaces/EPEvent.md)\>

Defined in: [clients/ep/plenaryClient.ts:365](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/plenaryClient.ts#L365)

Returns a single EP event by ID.
**EP API Endpoint:** `GET /events/{event-id}`

#### Parameters

##### eventId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`EPEvent`](../../../../types/ep/activities/interfaces/EPEvent.md)\>

***

### getEvents()

> **getEvents**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`EPEvent`](../../../../types/ep/activities/interfaces/EPEvent.md)\>\>

Defined in: [clients/ep/plenaryClient.ts:317](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/plenaryClient.ts#L317)

Returns EP events (hearings, conferences, etc.).
**EP API Endpoint:** `GET /events`

**Note:** The EP API `/events` endpoint does **not** support `year`,
`date-from`, or `date-to` query parameters — it has no date filtering
at all per the OpenAPI spec.  Only pagination (limit/offset) is supported.

#### Parameters

##### params?

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`EPEvent`](../../../../types/ep/activities/interfaces/EPEvent.md)\>\>

***

### getEventsFeed()

> **getEventsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/ep/plenaryClient.ts:348](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/plenaryClient.ts#L348)

Retrieves recently updated events via the feed endpoint.
**EP API Endpoint:** `GET /events/feed`

**Note:** The EP API `events/feed` endpoint is significantly slower
than other feed endpoints — it typically takes 30–50 s even for `one-week`
and 120+ seconds for `one-month`.  An extended minimum timeout of 120 s
is always applied.

#### Parameters

##### params?

###### activityType?

`string`

###### startDate?

`string`

###### timeframe?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getMeetingActivities()

> **getMeetingActivities**(`sittingId`, `params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MeetingActivity`](../../../../types/ep/activities/interfaces/MeetingActivity.md)\>\>

Defined in: [clients/ep/plenaryClient.ts:158](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/plenaryClient.ts#L158)

Returns activities linked to a specific meeting (plenary sitting).
**EP API Endpoint:** `GET /meetings/{sitting-id}/activities`

#### Parameters

##### sittingId

`string`

##### params?

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MeetingActivity`](../../../../types/ep/activities/interfaces/MeetingActivity.md)\>\>

***

### getMeetingById()

> **getMeetingById**(`eventId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PlenarySession`](../../../../types/ep/plenary/interfaces/PlenarySession.md)\>

Defined in: [clients/ep/plenaryClient.ts:298](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/plenaryClient.ts#L298)

Returns a single EP meeting by ID.
**EP API Endpoint:** `GET /meetings/{event-id}`

#### Parameters

##### eventId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PlenarySession`](../../../../types/ep/plenary/interfaces/PlenarySession.md)\>

***

### getMeetingDecisions()

> **getMeetingDecisions**(`sittingId`, `params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/ep/plenaryClient.ts:186](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/plenaryClient.ts#L186)

Returns decisions made in a specific meeting (plenary sitting).
**EP API Endpoint:** `GET /meetings/{sitting-id}/decisions`

#### Parameters

##### sittingId

`string`

##### params?

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getMeetingForeseenActivities()

> **getMeetingForeseenActivities**(`sittingId`, `params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MeetingActivity`](../../../../types/ep/activities/interfaces/MeetingActivity.md)\>\>

Defined in: [clients/ep/plenaryClient.ts:214](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/plenaryClient.ts#L214)

Returns foreseen activities linked to a specific meeting.
**EP API Endpoint:** `GET /meetings/{sitting-id}/foreseen-activities`

#### Parameters

##### sittingId

`string`

##### params?

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MeetingActivity`](../../../../types/ep/activities/interfaces/MeetingActivity.md)\>\>

***

### getMeetingPlenarySessionDocumentItems()

> **getMeetingPlenarySessionDocumentItems**(`sittingId`, `params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/ep/plenaryClient.ts:270](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/plenaryClient.ts#L270)

Returns plenary session document items for a specific meeting.
**EP API Endpoint:** `GET /meetings/{sitting-id}/plenary-session-document-items`

#### Parameters

##### sittingId

`string`

##### params?

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getMeetingPlenarySessionDocuments()

> **getMeetingPlenarySessionDocuments**(`sittingId`, `params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/ep/plenaryClient.ts:242](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/plenaryClient.ts#L242)

Returns plenary session documents for a specific meeting.
**EP API Endpoint:** `GET /meetings/{sitting-id}/plenary-session-documents`

#### Parameters

##### sittingId

`string`

##### params?

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getPlenarySessions()

> **getPlenarySessions**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`PlenarySession`](../../../../types/ep/plenary/interfaces/PlenarySession.md)\>\>

Defined in: [clients/ep/plenaryClient.ts:106](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/plenaryClient.ts#L106)

Retrieves plenary sessions with year/date and location filtering.

**EP API Endpoint:** `GET /meetings`

The EP API supports filtering by `year` (recommended for annual counts).
`dateFrom` / `dateTo` are also forwarded but may be ignored by the API
for certain endpoints.

#### Parameters

##### params

year, dateFrom, dateTo, location, limit, offset

###### dateFrom?

`string`

###### dateTo?

`string`

###### limit?

`number`

###### location?

`string`

###### offset?

`number`

###### year?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`PlenarySession`](../../../../types/ep/plenary/interfaces/PlenarySession.md)\>\>

Paginated plenary session list

***

### transformDocument()

> `private` **transformDocument**(`apiData`): [`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)

Defined in: [clients/ep/plenaryClient.ts:60](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/plenaryClient.ts#L60)

#### Parameters

##### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

#### Returns

[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)

***

### transformEvent()

> `private` **transformEvent**(`apiData`): [`EPEvent`](../../../../types/ep/activities/interfaces/EPEvent.md)

Defined in: [clients/ep/plenaryClient.ts:52](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/plenaryClient.ts#L52)

#### Parameters

##### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

#### Returns

[`EPEvent`](../../../../types/ep/activities/interfaces/EPEvent.md)

***

### transformMeetingActivity()

> `private` **transformMeetingActivity**(`apiData`): [`MeetingActivity`](../../../../types/ep/activities/interfaces/MeetingActivity.md)

Defined in: [clients/ep/plenaryClient.ts:56](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/plenaryClient.ts#L56)

#### Parameters

##### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

#### Returns

[`MeetingActivity`](../../../../types/ep/activities/interfaces/MeetingActivity.md)

***

### transformPlenarySession()

> `private` **transformPlenarySession**(`apiData`): [`PlenarySession`](../../../../types/ep/plenary/interfaces/PlenarySession.md)

Defined in: [clients/ep/plenaryClient.ts:48](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/plenaryClient.ts#L48)

#### Parameters

##### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

#### Returns

[`PlenarySession`](../../../../types/ep/plenary/interfaces/PlenarySession.md)
