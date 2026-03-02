[**European Parliament MCP Server API v1.1.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/vocabularyClient](../README.md) / VocabularyClient

# Class: VocabularyClient

Defined in: [clients/ep/vocabularyClient.ts:26](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/vocabularyClient.ts#L26)

Sub-client for EP controlled-vocabularies endpoints.

## Extends

- [`BaseEPClient`](../../baseClient/classes/BaseEPClient.md)

## Constructors

### Constructor

> **new VocabularyClient**(`config?`, `shared?`): `VocabularyClient`

Defined in: [clients/ep/vocabularyClient.ts:27](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/vocabularyClient.ts#L27)

#### Parameters

##### config?

`EPClientConfig` = `{}`

##### shared?

`EPSharedResources`

#### Returns

`VocabularyClient`

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

### clearCache()

> **clearCache**(): `void`

Defined in: [clients/ep/baseClient.ts:613](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L613)

Clears all entries from the LRU cache.

#### Returns

`void`

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`clearCache`](../../baseClient/classes/BaseEPClient.md#clearcache)

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

### getControlledVocabularies()

> **getControlledVocabularies**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/ep/vocabularyClient.ts:40](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/vocabularyClient.ts#L40)

Returns EP controlled vocabularies.
**EP API Endpoint:** `GET /controlled-vocabularies`

#### Parameters

##### params?

limit, offset

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Raw API response with vocabulary items

***

### getControlledVocabulariesFeed()

> **getControlledVocabulariesFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/ep/vocabularyClient.ts:61](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/vocabularyClient.ts#L61)

Retrieves recently updated controlled vocabularies via the feed endpoint.
**EP API Endpoint:** `GET /controlled-vocabularies/feed`

#### Parameters

##### params?

###### startDate?

`string`

###### timeframe?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getControlledVocabularyById()

> **getControlledVocabularyById**(`vocId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>

Defined in: [clients/ep/vocabularyClient.ts:79](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/vocabularyClient.ts#L79)

Returns a single EP Controlled Vocabulary by ID.
**EP API Endpoint:** `GET /controlled-vocabularies/{voc-id}`

#### Parameters

##### vocId

`string`

Vocabulary identifier

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>

Single vocabulary entry
