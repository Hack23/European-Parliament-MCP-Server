[**European Parliament MCP Server API v1.1.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/documentClient](../README.md) / DocumentClient

# Class: DocumentClient

Defined in: [clients/ep/documentClient.ts:35](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L35)

Sub-client for document EP API endpoints.

## Extends

- [`BaseEPClient`](../../baseClient/classes/BaseEPClient.md)

## Constructors

### Constructor

> **new DocumentClient**(`config?`, `shared?`): `DocumentClient`

Defined in: [clients/ep/documentClient.ts:36](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L36)

#### Parameters

##### config?

`EPClientConfig` = `{}`

##### shared?

`EPSharedResources`

#### Returns

`DocumentClient`

#### Overrides

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`constructor`](../../baseClient/classes/BaseEPClient.md#constructor)

## Properties

### baseURL

> `protected` `readonly` **baseURL**: `string`

Defined in: [clients/ep/baseClient.ts:217](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L217)

European Parliament API base URL.

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`baseURL`](../../baseClient/classes/BaseEPClient.md#baseurl)

***

### cache

> `protected` `readonly` **cache**: `LRUCache`\<`string`, [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>

Defined in: [clients/ep/baseClient.ts:215](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L215)

LRU cache for API responses.

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`cache`](../../baseClient/classes/BaseEPClient.md#cache)

***

### enableRetry

> `protected` `readonly` **enableRetry**: `boolean`

Defined in: [clients/ep/baseClient.ts:223](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L223)

Enable automatic retry on transient failures.

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`enableRetry`](../../baseClient/classes/BaseEPClient.md#enableretry)

***

### maxResponseBytes

> `protected` `readonly` **maxResponseBytes**: `number`

Defined in: [clients/ep/baseClient.ts:227](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L227)

Maximum allowed response body size in bytes.

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`maxResponseBytes`](../../baseClient/classes/BaseEPClient.md#maxresponsebytes)

***

### maxRetries

> `protected` `readonly` **maxRetries**: `number`

Defined in: [clients/ep/baseClient.ts:225](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L225)

Maximum number of retry attempts.

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`maxRetries`](../../baseClient/classes/BaseEPClient.md#maxretries)

***

### rateLimiter

> `protected` `readonly` **rateLimiter**: [`RateLimiter`](../../../../utils/rateLimiter/classes/RateLimiter.md)

Defined in: [clients/ep/baseClient.ts:219](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L219)

Token bucket rate limiter.

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`rateLimiter`](../../baseClient/classes/BaseEPClient.md#ratelimiter)

***

### timeoutMs

> `protected` `readonly` **timeoutMs**: `number`

Defined in: [clients/ep/baseClient.ts:221](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L221)

Request timeout in milliseconds.

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`timeoutMs`](../../baseClient/classes/BaseEPClient.md#timeoutms)

## Methods

### buildDocumentSearchParams()

> `private` **buildDocumentSearchParams**(`params`): [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Defined in: [clients/ep/documentClient.ts:52](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L52)

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

***

### clearCache()

> **clearCache**(): `void`

Defined in: [clients/ep/baseClient.ts:613](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L613)

Clears all entries from the LRU cache.

#### Returns

`void`

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`clearCache`](../../baseClient/classes/BaseEPClient.md#clearcache)

***

### filterDocuments()

> `private` **filterDocuments**(`documents`, `params`): [`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)[]

Defined in: [clients/ep/documentClient.ts:81](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L81)

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

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`get`](../../baseClient/classes/BaseEPClient.md#get)

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

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`getCacheStats`](../../baseClient/classes/BaseEPClient.md#getcachestats)

***

### getCommitteeDocumentById()

> **getCommitteeDocumentById**(`docId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>

Defined in: [clients/ep/documentClient.ts:408](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L408)

Returns a single committee document by ID.
**EP API Endpoint:** `GET /committee-documents/{doc-id}`

#### Parameters

##### docId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>

***

### getCommitteeDocuments()

> **getCommitteeDocuments**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/ep/documentClient.ts:201](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L201)

Returns committee documents.
**EP API Endpoint:** `GET /committee-documents`

#### Parameters

##### params?

###### limit?

`number`

###### offset?

`number`

###### year?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getCommitteeDocumentsFeed()

> **getCommitteeDocumentsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/ep/documentClient.ts:322](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L322)

Retrieves recently updated committee documents via the feed endpoint.
**EP API Endpoint:** `GET /committee-documents/feed`

#### Parameters

##### params?

###### startDate?

`string`

###### timeframe?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getDocumentById()

> **getDocumentById**(`docId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>

Defined in: [clients/ep/documentClient.ts:369](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L369)

Returns a single document by ID.
**EP API Endpoint:** `GET /documents/{doc-id}`

#### Parameters

##### docId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>

***

### getDocumentsFeed()

> **getDocumentsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/ep/documentClient.ts:292](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L292)

Retrieves recently updated documents via the feed endpoint.
**EP API Endpoint:** `GET /documents/feed`

#### Parameters

##### params?

###### startDate?

`string`

###### timeframe?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getExternalDocumentById()

> **getExternalDocumentById**(`docId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>

Defined in: [clients/ep/documentClient.ts:421](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L421)

Returns a single external document by ID.
**EP API Endpoint:** `GET /external-documents/{doc-id}`

#### Parameters

##### docId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>

***

### getExternalDocuments()

> **getExternalDocuments**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/ep/documentClient.ts:268](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L268)

Returns all External Documents.
**EP API Endpoint:** `GET /external-documents`

#### Parameters

##### params?

###### limit?

`number`

###### offset?

`number`

###### year?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getExternalDocumentsFeed()

> **getExternalDocumentsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/ep/documentClient.ts:352](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L352)

Retrieves recently updated external documents via the feed endpoint.
**EP API Endpoint:** `GET /external-documents/feed`

#### Parameters

##### params?

###### startDate?

`string`

###### timeframe?

`string`

###### workType?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getPlenaryDocumentById()

> **getPlenaryDocumentById**(`docId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>

Defined in: [clients/ep/documentClient.ts:382](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L382)

Returns a single plenary document by ID.
**EP API Endpoint:** `GET /plenary-documents/{doc-id}`

#### Parameters

##### docId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>

***

### getPlenaryDocuments()

> **getPlenaryDocuments**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/ep/documentClient.ts:177](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L177)

Returns plenary documents.
**EP API Endpoint:** `GET /plenary-documents`

#### Parameters

##### params?

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

> **getPlenaryDocumentsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/ep/documentClient.ts:307](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L307)

Retrieves recently updated plenary documents via the feed endpoint.
**EP API Endpoint:** `GET /plenary-documents/feed`

#### Parameters

##### params?

###### startDate?

`string`

###### timeframe?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getPlenarySessionDocumentById()

> **getPlenarySessionDocumentById**(`docId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>

Defined in: [clients/ep/documentClient.ts:395](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L395)

Returns a single plenary session document by ID.
**EP API Endpoint:** `GET /plenary-session-documents/{doc-id}`

#### Parameters

##### docId

`string`

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

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getPlenarySessionDocuments()

> **getPlenarySessionDocuments**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/ep/documentClient.ts:225](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L225)

Returns plenary session documents.
**EP API Endpoint:** `GET /plenary-session-documents`

#### Parameters

##### params?

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getPlenarySessionDocumentsFeed()

> **getPlenarySessionDocumentsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/ep/documentClient.ts:337](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L337)

Retrieves recently updated plenary session documents via the feed endpoint.
**EP API Endpoint:** `GET /plenary-session-documents/feed`

#### Parameters

##### params?

###### startDate?

`string`

###### timeframe?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### searchDocuments()

> **searchDocuments**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/ep/documentClient.ts:119](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L119)

Searches legislative documents by keyword, type, date, and committee.

**EP API Endpoint:** `GET /documents`

#### Parameters

##### params

keyword, documentType, dateFrom, dateTo, committee, limit, offset

###### keyword

`string`

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

Defined in: [clients/ep/documentClient.ts:42](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/documentClient.ts#L42)

#### Parameters

##### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

#### Returns

[`LegislativeDocument`](../../../../types/ep/document/interfaces/LegislativeDocument.md)
