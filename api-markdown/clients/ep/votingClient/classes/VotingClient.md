[**European Parliament MCP Server API v1.3.41**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/votingClient](../README.md) / VotingClient

# Class: VotingClient

Defined in: [clients/ep/votingClient.ts:34](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/votingClient.ts#L34)

Sub-client for voting records and speeches EP API endpoints.

## Extends

- [`BaseEPClient`](../../baseClient/classes/BaseEPClient.md)

## Constructors

### Constructor

> **new VotingClient**(`config?`, `shared?`): `VotingClient`

Defined in: [clients/ep/votingClient.ts:35](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/votingClient.ts#L35)

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

### fetchVoteResultsForSession()

> `private` **fetchVoteResultsForSession**(`sessionId`, `apiParams`, `abortSignal?`): `Promise`\<[`VotingRecord`](../../../../types/ep/plenary/interfaces/VotingRecord.md)[]\>

Defined in: [clients/ep/votingClient.ts:54](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/votingClient.ts#L54)

Fetches vote results for a specific sitting/session.

#### Parameters

##### sessionId

`string`

##### apiParams

`Record`\<`string`, `unknown`\>

##### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`VotingRecord`](../../../../types/ep/plenary/interfaces/VotingRecord.md)[]\>

#### Private

***

### fetchVoteResultsFromRecentMeetings()

> `private` **fetchVoteResultsFromRecentMeetings**(`params`): `Promise`\<[`VotingRecord`](../../../../types/ep/plenary/interfaces/VotingRecord.md)[]\>

Defined in: [clients/ep/votingClient.ts:72](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/votingClient.ts#L72)

Fetches vote results from recent meetings when no sessionId is given.

#### Parameters

##### params

###### abortSignal?

`AbortSignal`

###### dateFrom?

`string`

###### limit?

`number`

#### Returns

`Promise`\<[`VotingRecord`](../../../../types/ep/plenary/interfaces/VotingRecord.md)[]\>

#### Private

***

### filterVotingRecords()

> `private` **filterVotingRecords**(`records`, `params`): [`VotingRecord`](../../../../types/ep/plenary/interfaces/VotingRecord.md)[]

Defined in: [clients/ep/votingClient.ts:118](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/votingClient.ts#L118)

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

#### Private

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

### getSpeechById()

> **getSpeechById**(`speechId`, `options?`): `Promise`\<[`Speech`](../../../../types/ep/activities/interfaces/Speech.md)\>

Defined in: [clients/ep/votingClient.ts:240](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/votingClient.ts#L240)

Returns a single speech by ID.
**EP API Endpoint:** `GET /speeches/{speech-id}`

#### Parameters

##### speechId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`Speech`](../../../../types/ep/activities/interfaces/Speech.md)\>

***

### getSpeeches()

> **getSpeeches**(`params?`): `Promise`\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Speech`](../../../../types/ep/activities/interfaces/Speech.md)\>\>

Defined in: [clients/ep/votingClient.ts:211](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/votingClient.ts#L211)

Returns plenary speeches.
**EP API Endpoint:** `GET /speeches`

**Note:** The EP API `/speeches` endpoint does **not** support a
`year` query parameter.  It supports `sitting-date` (range start)
and `sitting-date-end` (range end) for date filtering.

Use `dateFrom` / `dateTo` (YYYY-MM-DD) for date-range queries —
these are mapped to `sitting-date` / `sitting-date-end`.

#### Parameters

##### params?

###### abortSignal?

`AbortSignal`

###### dateFrom?

`string`

###### dateTo?

`string`

###### limit?

`number`

###### offset?

`number`

#### Returns

`Promise`\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Speech`](../../../../types/ep/activities/interfaces/Speech.md)\>\>

***

### getVotingRecords()

> **getVotingRecords**(`params`): `Promise`\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`VotingRecord`](../../../../types/ep/plenary/interfaces/VotingRecord.md)\>\>

Defined in: [clients/ep/votingClient.ts:149](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/votingClient.ts#L149)

Retrieves voting records with filtering by session, topic, and date.

**EP API Endpoint:** `GET /meetings/{sitting-id}/vote-results`

#### Parameters

##### params

sessionId, topic, dateFrom, dateTo, limit, offset

###### abortSignal?

`AbortSignal`

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

`Promise`\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`VotingRecord`](../../../../types/ep/plenary/interfaces/VotingRecord.md)\>\>

Paginated voting records list

#### Security

Audit logged per GDPR Article 30

***

### transformSpeech()

> `private` **transformSpeech**(`apiData`): [`Speech`](../../../../types/ep/activities/interfaces/Speech.md)

Defined in: [clients/ep/votingClient.ts:46](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/votingClient.ts#L46)

#### Parameters

##### apiData

`Record`\<`string`, `unknown`\>

#### Returns

[`Speech`](../../../../types/ep/activities/interfaces/Speech.md)

***

### transformVoteResult()

> `private` **transformVoteResult**(`apiData`, `sessionId`): [`VotingRecord`](../../../../types/ep/plenary/interfaces/VotingRecord.md)

Defined in: [clients/ep/votingClient.ts:39](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/votingClient.ts#L39)

#### Parameters

##### apiData

`Record`\<`string`, `unknown`\>

##### sessionId

`string`

#### Returns

[`VotingRecord`](../../../../types/ep/plenary/interfaces/VotingRecord.md)
