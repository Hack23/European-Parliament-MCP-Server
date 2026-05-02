[**European Parliament MCP Server API v1.2.20**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/votingClient](../README.md) / VotingClient

# Class: VotingClient

Defined in: [clients/ep/votingClient.ts:36](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/votingClient.ts#L36)

Sub-client for voting records and speeches EP API endpoints.

## Extends

- [`BaseEPClient`](../../baseClient/classes/BaseEPClient.md)

## Constructors

### Constructor

> **new VotingClient**(`config?`, `shared?`): `VotingClient`

Defined in: [clients/ep/votingClient.ts:37](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/votingClient.ts#L37)

#### Parameters

##### config?

[`EPClientConfig`](../../baseClient/interfaces/EPClientConfig.md) = `{}`

##### shared?

[`EPSharedResources`](../../baseClient/interfaces/EPSharedResources.md)

#### Returns

`VotingClient`

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

### fetchVoteResultsForSession()

> `private` **fetchVoteResultsForSession**(`sessionId`, `apiParams`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`VotingRecord`](../../../../types/ep/plenary/interfaces/VotingRecord.md)[]\>

Defined in: [clients/ep/votingClient.ts:60](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/votingClient.ts#L60)

Fetches vote results for a specific sitting/session.

#### Parameters

##### sessionId

`string`

##### apiParams

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`VotingRecord`](../../../../types/ep/plenary/interfaces/VotingRecord.md)[]\>

***

### fetchVoteResultsFromRecentMeetings()

> `private` **fetchVoteResultsFromRecentMeetings**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`VotingRecord`](../../../../types/ep/plenary/interfaces/VotingRecord.md)[]\>

Defined in: [clients/ep/votingClient.ts:75](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/votingClient.ts#L75)

Fetches vote results from recent meetings when no sessionId is given.

#### Parameters

##### params

###### dateFrom?

`string`

###### limit?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`VotingRecord`](../../../../types/ep/plenary/interfaces/VotingRecord.md)[]\>

***

### filterVotingRecords()

> `private` **filterVotingRecords**(`records`, `params`): [`VotingRecord`](../../../../types/ep/plenary/interfaces/VotingRecord.md)[]

Defined in: [clients/ep/votingClient.ts:119](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/votingClient.ts#L119)

Applies client-side filters to voting records.

#### Parameters

##### records

[`VotingRecord`](../../../../types/ep/plenary/interfaces/VotingRecord.md)[]

##### params

###### dateFrom?

`string`

###### dateTo?

`string`

###### topic?

`string`

#### Returns

[`VotingRecord`](../../../../types/ep/plenary/interfaces/VotingRecord.md)[]

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

### getSpeechById()

> **getSpeechById**(`speechId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Speech`](../../../../types/ep/activities/interfaces/Speech.md)\>

Defined in: [clients/ep/votingClient.ts:245](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/votingClient.ts#L245)

Returns a single speech by ID.
**EP API Endpoint:** `GET /speeches/{speech-id}`

#### Parameters

##### speechId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Speech`](../../../../types/ep/activities/interfaces/Speech.md)\>

***

### getSpeeches()

> **getSpeeches**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Speech`](../../../../types/ep/activities/interfaces/Speech.md)\>\>

Defined in: [clients/ep/votingClient.ts:215](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/votingClient.ts#L215)

Returns plenary speeches.
**EP API Endpoint:** `GET /speeches`

**Note:** The EP API `/speeches` endpoint does **not** support a
`year` query parameter.  It supports `sitting-date` (range start)
and `sitting-date-end` (range end) for date filtering.

Use `dateFrom` / `dateTo` (YYYY-MM-DD) for date-range queries —
these are mapped to `sitting-date` / `sitting-date-end`.

#### Parameters

##### params?

###### dateFrom?

`string`

###### dateTo?

`string`

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Speech`](../../../../types/ep/activities/interfaces/Speech.md)\>\>

***

### getVotingRecords()

> **getVotingRecords**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`VotingRecord`](../../../../types/ep/plenary/interfaces/VotingRecord.md)\>\>

Defined in: [clients/ep/votingClient.ts:152](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/votingClient.ts#L152)

Retrieves voting records with filtering by session, topic, and date.

**EP API Endpoint:** `GET /meetings/{sitting-id}/vote-results`

#### Parameters

##### params

sessionId, topic, dateFrom, dateTo, limit, offset

###### dateFrom?

`string`

###### dateTo?

`string`

###### limit?

`number`

###### offset?

`number`

###### sessionId?

`string`

###### topic?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`VotingRecord`](../../../../types/ep/plenary/interfaces/VotingRecord.md)\>\>

Paginated voting records list

#### Security

Audit logged per GDPR Article 30

***

### transformSpeech()

> `private` **transformSpeech**(`apiData`): [`Speech`](../../../../types/ep/activities/interfaces/Speech.md)

Defined in: [clients/ep/votingClient.ts:50](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/votingClient.ts#L50)

#### Parameters

##### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

#### Returns

[`Speech`](../../../../types/ep/activities/interfaces/Speech.md)

***

### transformVoteResult()

> `private` **transformVoteResult**(`apiData`, `sessionId`): [`VotingRecord`](../../../../types/ep/plenary/interfaces/VotingRecord.md)

Defined in: [clients/ep/votingClient.ts:43](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/votingClient.ts#L43)

#### Parameters

##### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

##### sessionId

`string`

#### Returns

[`VotingRecord`](../../../../types/ep/plenary/interfaces/VotingRecord.md)
