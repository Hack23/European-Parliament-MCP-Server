[**European Parliament MCP Server API v1.4.3**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/mepClient](../README.md) / MEPClient

# Class: MEPClient

Defined in: [clients/ep/mepClient.ts:43](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L43)

Sub-client for MEP-related European Parliament API endpoints.

Handles all MEP data fetching: active lists, individual profiles,
incoming/outgoing/homonym lists, and financial declarations.

## Extends

- [`BaseEPClient`](../../baseClient/classes/BaseEPClient.md)

## Constructors

### Constructor

> **new MEPClient**(`config?`, `shared?`): `MEPClient`

Defined in: [clients/ep/mepClient.ts:44](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L44)

#### Parameters

##### config?

[`EPClientConfig`](../../baseClient/interfaces/EPClientConfig.md) = `{}`

##### shared?

[`EPSharedResources`](../../baseClient/interfaces/EPSharedResources.md)

#### Returns

`MEPClient`

#### Overrides

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`constructor`](../../baseClient/classes/BaseEPClient.md#constructor)

## Properties

### baseURL

> `protected` `readonly` **baseURL**: `string`

Defined in: [clients/ep/baseClient.ts:221](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L221)

European Parliament API base URL.

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`baseURL`](../../baseClient/classes/BaseEPClient.md#baseurl)

***

### cache

> `protected` `readonly` **cache**: `LRUCache`\<`string`, `Record`\<`string`, `unknown`\>\>

Defined in: [clients/ep/baseClient.ts:219](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L219)

LRU cache for API responses.

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`cache`](../../baseClient/classes/BaseEPClient.md#cache)

***

### enableRetry

> `protected` `readonly` **enableRetry**: `boolean`

Defined in: [clients/ep/baseClient.ts:227](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L227)

Enable automatic retry on transient failures.

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`enableRetry`](../../baseClient/classes/BaseEPClient.md#enableretry)

***

### maxResponseBytes

> `protected` `readonly` **maxResponseBytes**: `number`

Defined in: [clients/ep/baseClient.ts:231](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L231)

Maximum allowed response body size in bytes.

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`maxResponseBytes`](../../baseClient/classes/BaseEPClient.md#maxresponsebytes)

***

### maxRetries

> `protected` `readonly` **maxRetries**: `number`

Defined in: [clients/ep/baseClient.ts:229](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L229)

Maximum number of retry attempts.

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`maxRetries`](../../baseClient/classes/BaseEPClient.md#maxretries)

***

### rateLimiter

> `protected` `readonly` **rateLimiter**: [`RateLimiter`](../../../../utils/rateLimiter/classes/RateLimiter.md)

Defined in: [clients/ep/baseClient.ts:223](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L223)

Token bucket rate limiter.

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`rateLimiter`](../../baseClient/classes/BaseEPClient.md#ratelimiter)

***

### timeoutMs

> `protected` `readonly` **timeoutMs**: `number`

Defined in: [clients/ep/baseClient.ts:225](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L225)

Request timeout in milliseconds.

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`timeoutMs`](../../baseClient/classes/BaseEPClient.md#timeoutms)

## Methods

### buildMEPParams()

> `private` **buildMEPParams**(`params`): `Record`\<`string`, `unknown`\>

Defined in: [clients/ep/mepClient.ts:64](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L64)

Maps getMEPs params to EP API query parameters.

#### Parameters

##### params

###### active?

`boolean`

###### committee?

`string`

###### country?

`string`

###### group?

`string`

###### limit?

`number`

###### offset?

`number`

#### Returns

`Record`\<`string`, `unknown`\>

#### Private

***

### clearCache()

> **clearCache**(): `void`

Defined in: [clients/ep/baseClient.ts:770](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L770)

Clears all entries from the LRU cache.

#### Returns

`void`

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`clearCache`](../../baseClient/classes/BaseEPClient.md#clearcache)

***

### evictFromCache()

> `protected` **evictFromCache**(`endpoint`, `params?`): `void`

Defined in: [clients/ep/baseClient.ts:785](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L785)

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

### fetchAllCurrentMEPs()

> `private` **fetchAllCurrentMEPs**(`abortSignal?`): `Promise`\<[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)[]\>

Defined in: [clients/ep/mepClient.ts:103](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L103)

Fetch all current MEPs in paginated batches (max 100 per request).

#### Parameters

##### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)[]\>

***

### filterMEPs()

> `private` **filterMEPs**(`meps`, `country`, `group`): [`MEP`](../../../../types/ep/mep/interfaces/MEP.md)[]

Defined in: [clients/ep/mepClient.ts:83](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L83)

Apply optional client-side country and group filters to an MEP array.

#### Parameters

##### meps

[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)[]

##### country

`string` \| `undefined`

##### group

`string` \| `undefined`

#### Returns

[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)[]

***

### get()

> `protected` **get**\<`T`\>(`endpoint`, `params?`, `minimumTimeoutMs?`, `abortSignal?`): `Promise`\<`T`\>

Defined in: [clients/ep/baseClient.ts:687](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L687)

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

Defined in: [clients/ep/baseClient.ts:794](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L794)

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

### getCurrentMEPs()

> **getCurrentMEPs**(`params?`): `Promise`\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)\>\>

Defined in: [clients/ep/mepClient.ts:282](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L282)

Returns all currently active MEPs for today's date.

Unlike `getMEPs()`, this uses `GET /meps/show-current` which returns
`api:country-of-representation` and `api:political-group` in responses.
Optional `country` and `group` filters are applied client-side after fetch.

**EP API Endpoint:** `GET /meps/show-current`

#### Parameters

##### params?

Optional filters and pagination

###### abortSignal?

`AbortSignal`

###### country?

`string`

ISO 3166-1 alpha-2 country code for client-side filtering

###### group?

`string`

Political group identifier for client-side filtering

###### limit?

`number`

Maximum results to return (default 50)

###### offset?

`number`

Pagination offset (default 0)

#### Returns

`Promise`\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)\>\>

***

### getHomonymMEPs()

> **getHomonymMEPs**(`params?`): `Promise`\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)\>\>

Defined in: [clients/ep/mepClient.ts:362](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L362)

Returns homonym MEPs for the current parliamentary term.
**EP API Endpoint:** `GET /meps/show-homonyms`

#### Parameters

##### params?

###### abortSignal?

`AbortSignal`

###### limit?

`number`

###### offset?

`number`

#### Returns

`Promise`\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)\>\>

***

### getIncomingMEPs()

> **getIncomingMEPs**(`params?`): `Promise`\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)\>\>

Defined in: [clients/ep/mepClient.ts:314](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L314)

Returns all incoming MEPs for the current parliamentary term.
**EP API Endpoint:** `GET /meps/show-incoming`

#### Parameters

##### params?

###### abortSignal?

`AbortSignal`

###### limit?

`number`

###### offset?

`number`

#### Returns

`Promise`\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)\>\>

***

### getMEPDeclarationById()

> **getMEPDeclarationById**(`docId`, `options?`): `Promise`\<[`MEPDeclaration`](../../../../types/ep/activities/interfaces/MEPDeclaration.md)\>

Defined in: [clients/ep/mepClient.ts:461](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L461)

Returns a single MEP declaration by document ID.
**EP API Endpoint:** `GET /meps-declarations/{doc-id}`

#### Parameters

##### docId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`MEPDeclaration`](../../../../types/ep/activities/interfaces/MEPDeclaration.md)\>

#### Gdpr

Declarations contain personal financial data – access is audit-logged

***

### getMEPDeclarations()

> **getMEPDeclarations**(`params?`): `Promise`\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEPDeclaration`](../../../../types/ep/activities/interfaces/MEPDeclaration.md)\>\>

Defined in: [clients/ep/mepClient.ts:387](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L387)

Returns MEP declarations of financial interests.
**EP API Endpoint:** `GET /meps-declarations`

#### Parameters

##### params?

###### abortSignal?

`AbortSignal`

###### limit?

`number`

###### offset?

`number`

###### year?

`number`

#### Returns

`Promise`\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEPDeclaration`](../../../../types/ep/activities/interfaces/MEPDeclaration.md)\>\>

#### Gdpr

Declarations contain personal financial data – access is audit-logged

***

### getMEPDeclarationsFeed()

> **getMEPDeclarationsFeed**(`params?`): `Promise`\<[`JSONLDResponse`](../../baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

Defined in: [clients/ep/mepClient.ts:439](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L439)

Retrieves recently updated MEP declarations via the feed endpoint.
**EP API Endpoint:** `GET /meps-declarations/feed`

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

### getMEPDetails()

> **getMEPDetails**(`id`, `options?`): `Promise`\<[`MEPDetails`](../../../../types/ep/mep/interfaces/MEPDetails.md)\>

Defined in: [clients/ep/mepClient.ts:238](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L238)

Retrieves detailed information about a specific MEP.

Supports numeric ID ("124936"), person URI ("person/124936"),
or MEP-prefixed ID ("MEP-124936").

#### Parameters

##### id

`string`

MEP identifier in any supported format

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`MEPDetails`](../../../../types/ep/mep/interfaces/MEPDetails.md)\>

Detailed MEP information

#### Security

Personal data access logged per GDPR Article 30

***

### getMEPs()

> **getMEPs**(`params`): `Promise`\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)\>\>

Defined in: [clients/ep/mepClient.ts:190](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L190)

Retrieves Members of the European Parliament with filtering and pagination.

#### Parameters

##### params

Country, group, committee, active status, limit, offset

###### abortSignal?

`AbortSignal`

###### active?

`boolean`

###### committee?

`string`

###### country?

`string`

###### group?

`string`

###### limit?

`number`

###### offset?

`number`

#### Returns

`Promise`\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)\>\>

Paginated MEP list

#### Security

Personal data access logged per GDPR Article 30

***

### getMEPsFeed()

> **getMEPsFeed**(`params?`): `Promise`\<[`JSONLDResponse`](../../baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

Defined in: [clients/ep/mepClient.ts:418](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L418)

Retrieves recently updated MEPs via the feed endpoint.
**EP API Endpoint:** `GET /meps/feed`

Configurable-window feed.  Extended timeout applied for `one-month`.

#### Parameters

##### params?

###### abortSignal?

`AbortSignal`

###### startDate?

`string`

###### timeframe?

`string`

#### Returns

`Promise`\<[`JSONLDResponse`](../../baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

***

### getMEPsFromLegacyEndpoint()

> `private` **getMEPsFromLegacyEndpoint**(`params`, `limit`, `offset`): `Promise`\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)\>\>

Defined in: [clients/ep/mepClient.ts:154](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L154)

#### Parameters

##### params

###### abortSignal?

`AbortSignal`

###### active?

`boolean`

###### committee?

`string`

###### country?

`string`

###### group?

`string`

###### limit?

`number`

###### offset?

`number`

##### limit

`number`

##### offset

`number`

#### Returns

`Promise`\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)\>\>

***

### getOutgoingMEPs()

> **getOutgoingMEPs**(`params?`): `Promise`\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)\>\>

Defined in: [clients/ep/mepClient.ts:338](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L338)

Returns all outgoing MEPs for the current parliamentary term.
**EP API Endpoint:** `GET /meps/show-outgoing`

#### Parameters

##### params?

###### abortSignal?

`AbortSignal`

###### limit?

`number`

###### offset?

`number`

#### Returns

`Promise`\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)\>\>

***

### paginateFiltered()

> `private` **paginateFiltered**(`meps`, `limit`, `offset`, `filtered`): [`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)\>

Defined in: [clients/ep/mepClient.ts:126](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L126)

Build paginated result from filtered MEPs.

#### Parameters

##### meps

[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)[]

##### limit

`number`

##### offset

`number`

##### filtered

`boolean`

#### Returns

[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)\>

***

### shouldUseCurrentMEPList()

> `private` **shouldUseCurrentMEPList**(`params`): `boolean`

Defined in: [clients/ep/mepClient.ts:139](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L139)

#### Parameters

##### params

###### active?

`boolean`

###### committee?

`string`

###### country?

`string`

###### group?

`string`

#### Returns

`boolean`

***

### transformMEP()

> `private` **transformMEP**(`apiData`): [`MEP`](../../../../types/ep/mep/interfaces/MEP.md)

Defined in: [clients/ep/mepClient.ts:48](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L48)

#### Parameters

##### apiData

`Record`\<`string`, `unknown`\>

#### Returns

[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)

***

### transformMEPDeclaration()

> `private` **transformMEPDeclaration**(`apiData`): [`MEPDeclaration`](../../../../types/ep/activities/interfaces/MEPDeclaration.md)

Defined in: [clients/ep/mepClient.ts:56](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L56)

#### Parameters

##### apiData

`Record`\<`string`, `unknown`\>

#### Returns

[`MEPDeclaration`](../../../../types/ep/activities/interfaces/MEPDeclaration.md)

***

### transformMEPDetails()

> `private` **transformMEPDetails**(`apiData`): [`MEPDetails`](../../../../types/ep/mep/interfaces/MEPDetails.md)

Defined in: [clients/ep/mepClient.ts:52](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L52)

#### Parameters

##### apiData

`Record`\<`string`, `unknown`\>

#### Returns

[`MEPDetails`](../../../../types/ep/mep/interfaces/MEPDetails.md)
