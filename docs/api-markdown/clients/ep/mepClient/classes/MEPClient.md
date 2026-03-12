[**European Parliament MCP Server API v1.1.8**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/mepClient](../README.md) / MEPClient

# Class: MEPClient

Defined in: [clients/ep/mepClient.ts:44](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L44)

Sub-client for MEP-related European Parliament API endpoints.

Handles all MEP data fetching: active lists, individual profiles,
incoming/outgoing/homonym lists, and financial declarations.

## Extends

- [`BaseEPClient`](../../baseClient/classes/BaseEPClient.md)

## Constructors

### Constructor

> **new MEPClient**(`config?`, `shared?`): `MEPClient`

Defined in: [clients/ep/mepClient.ts:45](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L45)

#### Parameters

##### config?

`EPClientConfig` = `{}`

##### shared?

`EPSharedResources`

#### Returns

`MEPClient`

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

### buildMEPParams()

> `private` **buildMEPParams**(`params`): [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Defined in: [clients/ep/mepClient.ts:69](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L69)

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

### fetchAllCurrentMEPs()

> `private` **fetchAllCurrentMEPs**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)[]\>

Defined in: [clients/ep/mepClient.ts:108](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L108)

Fetch all current MEPs in paginated batches (max 100 per request).

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)[]\>

***

### filterMEPs()

> `private` **filterMEPs**(`meps`, `country`, `group`): [`MEP`](../../../../types/ep/mep/interfaces/MEP.md)[]

Defined in: [clients/ep/mepClient.ts:88](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L88)

Apply optional client-side country and group filters to an MEP array.

#### Parameters

##### meps

[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)[]

##### country

`string` | `undefined`

##### group

`string` | `undefined`

#### Returns

[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)[]

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

### getCurrentMEPs()

> **getCurrentMEPs**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)\>\>

Defined in: [clients/ep/mepClient.ts:238](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L238)

Returns all currently active MEPs for today's date.

Unlike `getMEPs()`, this uses `GET /meps/show-current` which returns
`api:country-of-representation` and `api:political-group` in responses.
Optional `country` and `group` filters are applied client-side after fetch.

**EP API Endpoint:** `GET /meps/show-current`

#### Parameters

##### params?

Optional filters and pagination

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)\>\>

***

### getHomonymMEPs()

> **getHomonymMEPs**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)\>\>

Defined in: [clients/ep/mepClient.ts:318](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L318)

Returns homonym MEPs for the current parliamentary term.
**EP API Endpoint:** `GET /meps/show-homonyms`

#### Parameters

##### params?

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)\>\>

***

### getIncomingMEPs()

> **getIncomingMEPs**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)\>\>

Defined in: [clients/ep/mepClient.ts:274](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L274)

Returns all incoming MEPs for the current parliamentary term.
**EP API Endpoint:** `GET /meps/show-incoming`

#### Parameters

##### params?

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)\>\>

***

### getMEPDeclarationById()

> **getMEPDeclarationById**(`docId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MEPDeclaration`](../../../../types/ep/activities/interfaces/MEPDeclaration.md)\>

Defined in: [clients/ep/mepClient.ts:401](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L401)

Returns a single MEP declaration by document ID.
**EP API Endpoint:** `GET /meps-declarations/{doc-id}`

#### Parameters

##### docId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MEPDeclaration`](../../../../types/ep/activities/interfaces/MEPDeclaration.md)\>

#### Gdpr

Declarations contain personal financial data – access is audit-logged

***

### getMEPDeclarations()

> **getMEPDeclarations**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEPDeclaration`](../../../../types/ep/activities/interfaces/MEPDeclaration.md)\>\>

Defined in: [clients/ep/mepClient.ts:341](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L341)

Returns MEP declarations of financial interests.
**EP API Endpoint:** `GET /meps-declarations`

#### Parameters

##### params?

###### limit?

`number`

###### offset?

`number`

###### year?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEPDeclaration`](../../../../types/ep/activities/interfaces/MEPDeclaration.md)\>\>

#### Gdpr

Declarations contain personal financial data – access is audit-logged

***

### getMEPDeclarationsFeed()

> **getMEPDeclarationsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/ep/mepClient.ts:383](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L383)

Retrieves recently updated MEP declarations via the feed endpoint.
**EP API Endpoint:** `GET /meps-declarations/feed`

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

### getMEPDetails()

> **getMEPDetails**(`id`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MEPDetails`](../../../../types/ep/mep/interfaces/MEPDetails.md)\>

Defined in: [clients/ep/mepClient.ts:194](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L194)

Retrieves detailed information about a specific MEP.

Supports numeric ID ("124936"), person URI ("person/124936"),
or MEP-prefixed ID ("MEP-124936").

#### Parameters

##### id

`string`

MEP identifier in any supported format

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MEPDetails`](../../../../types/ep/mep/interfaces/MEPDetails.md)\>

Detailed MEP information

#### Security

Personal data access logged per GDPR Article 30

***

### getMEPs()

> **getMEPs**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)\>\>

Defined in: [clients/ep/mepClient.ts:149](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L149)

Retrieves Members of the European Parliament with filtering and pagination.

#### Parameters

##### params

Country, group, committee, active status, limit, offset

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)\>\>

Paginated MEP list

#### Security

Personal data access logged per GDPR Article 30

***

### getMEPsFeed()

> **getMEPsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/ep/mepClient.ts:368](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L368)

Retrieves recently updated MEPs via the feed endpoint.
**EP API Endpoint:** `GET /meps/feed`

#### Parameters

##### params?

###### startDate?

`string`

###### timeframe?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getOutgoingMEPs()

> **getOutgoingMEPs**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)\>\>

Defined in: [clients/ep/mepClient.ts:296](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L296)

Returns all outgoing MEPs for the current parliamentary term.
**EP API Endpoint:** `GET /meps/show-outgoing`

#### Parameters

##### params?

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)\>\>

***

### paginateFiltered()

> `private` **paginateFiltered**(`meps`, `limit`, `offset`, `filtered`): [`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)\>

Defined in: [clients/ep/mepClient.ts:131](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L131)

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

### transformMEP()

> `private` **transformMEP**(`apiData`): [`MEP`](../../../../types/ep/mep/interfaces/MEP.md)

Defined in: [clients/ep/mepClient.ts:51](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L51)

#### Parameters

##### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

#### Returns

[`MEP`](../../../../types/ep/mep/interfaces/MEP.md)

***

### transformMEPDeclaration()

> `private` **transformMEPDeclaration**(`apiData`): [`MEPDeclaration`](../../../../types/ep/activities/interfaces/MEPDeclaration.md)

Defined in: [clients/ep/mepClient.ts:59](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L59)

#### Parameters

##### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

#### Returns

[`MEPDeclaration`](../../../../types/ep/activities/interfaces/MEPDeclaration.md)

***

### transformMEPDetails()

> `private` **transformMEPDetails**(`apiData`): [`MEPDetails`](../../../../types/ep/mep/interfaces/MEPDetails.md)

Defined in: [clients/ep/mepClient.ts:55](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/mepClient.ts#L55)

#### Parameters

##### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

#### Returns

[`MEPDetails`](../../../../types/ep/mep/interfaces/MEPDetails.md)
