[**European Parliament MCP Server API v1.3.21**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/documentClient](../README.md) / DocumentClient

# Class: DocumentClient

Defined in: [clients/ep/documentClient.ts:34](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L34)

Sub-client for document EP API endpoints.

## Extends

- [`BaseEPClient`](../../baseClient/classes/BaseEPClient.md)

## Constructors

### Constructor

> **new DocumentClient**(`config?`, `shared?`): `DocumentClient`

Defined in: [clients/ep/documentClient.ts:35](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L35)

#### Parameters

##### config?

[`EPClientConfig`](../../baseClient/interfaces/EPClientConfig.md) = `{}`

##### shared?

[`EPSharedResources`](../../baseClient/interfaces/EPSharedResources.md)

#### Returns

`DocumentClient`

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

> `protected` `readonly` **cache**: `LRUCache`\<`string`, [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>

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

### buildDocumentSearchParams()

> `private` **buildDocumentSearchParams**(`params`): [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Defined in: [clients/ep/documentClient.ts:47](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L47)

Builds EP API parameters for document search.

#### Parameters

##### params

###### dateFrom?

`string`

###### documentType?

`string`

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

#### Private

***

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

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Optional query parameters (same value passed to [get](../../baseClient/classes/BaseEPClient.md#get))

#### Returns

`void`

#### Protected

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`evictFromCache`](../../baseClient/classes/BaseEPClient.md#evictfromcache)

***

### filterDocuments()

> `private` **filterDocuments**(`documents`, `params`): [`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)[]

Defined in: [clients/ep/documentClient.ts:80](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L80)

Applies client-side keyword, committee, and date-range filters to documents.

#### Parameters

##### documents

[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)[]

##### params

###### committee?

`string`

###### dateTo?

`string`

###### keyword?

`string`

#### Returns

[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)[]

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

### getCommitteeDocumentById()

> **getCommitteeDocumentById**(`docId`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>

Defined in: [clients/ep/documentClient.ts:424](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L424)

Returns a single committee document by ID.
**EP API Endpoint:** `GET /committee-documents/{doc-id}`

#### Parameters

##### docId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>

***

### getCommitteeDocuments()

> **getCommitteeDocuments**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/ep/documentClient.ts:199](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L199)

Returns committee documents.
**EP API Endpoint:** `GET /committee-documents`

**Note:** The EP API `/committee-documents` endpoint does **not**
support a `year` query parameter per the OpenAPI spec.
Only pagination (limit/offset) is supported.

#### Parameters

##### params?

###### abortSignal?

`AbortSignal`

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getCommitteeDocumentsFeed()

> **getCommitteeDocumentsFeed**(`options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/ep/documentClient.ts:331](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L331)

Retrieves recently updated committee documents via the feed endpoint.
**EP API Endpoint:** `GET /committee-documents/feed`

Fixed-window feed — no `timeframe` parameter.
Extended timeout applied (120 s minimum).

#### Parameters

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getDocumentById()

> **getDocumentById**(`docId`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>

Defined in: [clients/ep/documentClient.ts:379](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L379)

Returns a single document by ID.
**EP API Endpoint:** `GET /documents/{doc-id}`

#### Parameters

##### docId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>

***

### getDocumentsFeed()

> **getDocumentsFeed**(`options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/ep/documentClient.ts:305](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L305)

Retrieves recently updated documents via the feed endpoint.
**EP API Endpoint:** `GET /documents/feed`

This is a **fixed-window feed** — the EP API does NOT accept a
`timeframe` parameter.  It returns updates from a server-defined
default window (typically one month).  Response times can exceed
120 s, so an extended minimum timeout is applied automatically.

#### Parameters

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getExternalDocumentById()

> **getExternalDocumentById**(`docId`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>

Defined in: [clients/ep/documentClient.ts:439](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L439)

Returns a single external document by ID.
**EP API Endpoint:** `GET /external-documents/{doc-id}`

#### Parameters

##### docId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>

***

### getExternalDocuments()

> **getExternalDocuments**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/ep/documentClient.ts:276](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L276)

Returns all External Documents.
**EP API Endpoint:** `GET /external-documents`

**Note:** The EP API `/external-documents` endpoint does **not**
support a `year` query parameter per the OpenAPI spec.
Only pagination (limit/offset) is supported.

#### Parameters

##### params?

###### abortSignal?

`AbortSignal`

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getExternalDocumentsFeed()

> **getExternalDocumentsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/ep/documentClient.ts:358](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L358)

Retrieves recently updated external documents via the feed endpoint.
**EP API Endpoint:** `GET /external-documents/feed`

This is a **configurable-window feed** that accepts `timeframe`,
`start-date`, and `work-type` parameters.
Extended timeout applied for `one-month` timeframe.

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getPlenaryDocumentById()

> **getPlenaryDocumentById**(`docId`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>

Defined in: [clients/ep/documentClient.ts:394](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L394)

Returns a single plenary document by ID.
**EP API Endpoint:** `GET /plenary-documents/{doc-id}`

#### Parameters

##### docId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>

***

### getPlenaryDocuments()

> **getPlenaryDocuments**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/ep/documentClient.ts:169](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L169)

Returns plenary documents.
**EP API Endpoint:** `GET /plenary-documents`

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getPlenaryDocumentsFeed()

> **getPlenaryDocumentsFeed**(`options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/ep/documentClient.ts:318](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L318)

Retrieves recently updated plenary documents via the feed endpoint.
**EP API Endpoint:** `GET /plenary-documents/feed`

Fixed-window feed — no `timeframe` parameter.
Extended timeout applied (120 s minimum).

#### Parameters

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getPlenarySessionDocumentById()

> **getPlenarySessionDocumentById**(`docId`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>

Defined in: [clients/ep/documentClient.ts:409](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L409)

Returns a single plenary session document by ID.
**EP API Endpoint:** `GET /plenary-session-documents/{doc-id}`

#### Parameters

##### docId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>

***

### getPlenarySessionDocumentItems()

> **getPlenarySessionDocumentItems**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/ep/documentClient.ts:247](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L247)

Returns all Plenary Session Document Items.
**EP API Endpoint:** `GET /plenary-session-documents-items`

#### Parameters

##### params?

###### abortSignal?

`AbortSignal`

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getPlenarySessionDocuments()

> **getPlenarySessionDocuments**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/ep/documentClient.ts:223](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L223)

Returns plenary session documents.
**EP API Endpoint:** `GET /plenary-session-documents`

#### Parameters

##### params?

###### abortSignal?

`AbortSignal`

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getPlenarySessionDocumentsFeed()

> **getPlenarySessionDocumentsFeed**(`options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/ep/documentClient.ts:344](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L344)

Retrieves recently updated plenary session documents via the feed endpoint.
**EP API Endpoint:** `GET /plenary-session-documents/feed`

Fixed-window feed — no `timeframe` parameter.
Extended timeout applied (120 s minimum).

#### Parameters

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### searchDocuments()

> **searchDocuments**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/ep/documentClient.ts:116](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L116)

Searches legislative documents by keyword, type, date, and committee.

**EP API Endpoint:** `GET /documents`

#### Parameters

##### params

keyword, documentType, dateFrom, dateTo, committee, limit, offset

###### keyword

`string`

###### abortSignal?

`AbortSignal`

###### committee?

`string`

###### dateFrom?

`string`

###### dateTo?

`string`

###### documentType?

`string`

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Paginated legislative documents list

#### Security

Audit logged per GDPR Article 30

***

### transformDocument()

> `private` **transformDocument**(`apiData`): [`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)

Defined in: [clients/ep/documentClient.ts:39](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L39)

#### Parameters

##### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

#### Returns

[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)
