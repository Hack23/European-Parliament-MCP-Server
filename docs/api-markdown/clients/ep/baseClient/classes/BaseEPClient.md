[**European Parliament MCP Server API v0.8.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/baseClient](../README.md) / BaseEPClient

# Class: BaseEPClient

Defined in: [clients/ep/baseClient.ts:123](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/clients/ep/baseClient.ts#L123)

Base class for European Parliament API sub-clients.

Holds the shared HTTP machinery: LRU cache, token-bucket rate limiter,
timeout/abort controller, and retry logic.  Sub-clients extend this class
and call the protected `get()` helper for all HTTP requests.

 BaseEPClient

## Extended by

- [`CommitteeClient`](../../committeeClient/classes/CommitteeClient.md)
- [`DocumentClient`](../../documentClient/classes/DocumentClient.md)
- [`LegislativeClient`](../../legislativeClient/classes/LegislativeClient.md)
- [`MEPClient`](../../mepClient/classes/MEPClient.md)
- [`PlenaryClient`](../../plenaryClient/classes/PlenaryClient.md)
- [`QuestionClient`](../../questionClient/classes/QuestionClient.md)
- [`VocabularyClient`](../../vocabularyClient/classes/VocabularyClient.md)
- [`VotingClient`](../../votingClient/classes/VotingClient.md)

## Constructors

### Constructor

> **new BaseEPClient**(`config?`, `shared?`): `BaseEPClient`

Defined in: [clients/ep/baseClient.ts:147](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/clients/ep/baseClient.ts#L147)

Creates a BaseEPClient.

When `shared` is provided the constructor reuses those pre-built resources
instead of allocating new ones; this is the mechanism used by the facade to
ensure all sub-clients share one cache and one rate-limiter.

#### Parameters

##### config?

`EPClientConfig` = `{}`

Client configuration (used when `shared` is absent)

##### shared?

`EPSharedResources`

Pre-built shared resources (passed by facade to sub-clients)

#### Returns

`BaseEPClient`

## Properties

### baseURL

> `protected` `readonly` **baseURL**: `string`

Defined in: [clients/ep/baseClient.ts:127](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/clients/ep/baseClient.ts#L127)

European Parliament API base URL.

***

### cache

> `protected` `readonly` **cache**: `LRUCache`\<`string`, [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>

Defined in: [clients/ep/baseClient.ts:125](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/clients/ep/baseClient.ts#L125)

LRU cache for API responses.

***

### enableRetry

> `protected` `readonly` **enableRetry**: `boolean`

Defined in: [clients/ep/baseClient.ts:133](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/clients/ep/baseClient.ts#L133)

Enable automatic retry on transient failures.

***

### maxRetries

> `protected` `readonly` **maxRetries**: `number`

Defined in: [clients/ep/baseClient.ts:135](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/clients/ep/baseClient.ts#L135)

Maximum number of retry attempts.

***

### rateLimiter

> `protected` `readonly` **rateLimiter**: [`RateLimiter`](../../../../utils/rateLimiter/classes/RateLimiter.md)

Defined in: [clients/ep/baseClient.ts:129](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/clients/ep/baseClient.ts#L129)

Token bucket rate limiter.

***

### timeoutMs

> `protected` `readonly` **timeoutMs**: `number`

Defined in: [clients/ep/baseClient.ts:131](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/clients/ep/baseClient.ts#L131)

Request timeout in milliseconds.

## Methods

### buildRequestUrl()

> `private` **buildRequestUrl**(`endpoint`, `params?`): `URL`

Defined in: [clients/ep/baseClient.ts:184](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/clients/ep/baseClient.ts#L184)

Builds the full request URL from endpoint + optional params.

#### Parameters

##### endpoint

`string`

##### params?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

#### Returns

`URL`

***

### clearCache()

> **clearCache**(): `void`

Defined in: [clients/ep/baseClient.ts:341](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/clients/ep/baseClient.ts#L341)

Clears all entries from the LRU cache.

#### Returns

`void`

***

### fetchWithRetry()

> `private` **fetchWithRetry**\<`T`\>(`url`, `endpoint`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [clients/ep/baseClient.ts:250](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/clients/ep/baseClient.ts#L250)

Wraps a fetch call with the configured retry policy.

#### Type Parameters

##### T

`T`

#### Parameters

##### url

`URL`

##### endpoint

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

***

### fetchWithTimeout()

> `private` **fetchWithTimeout**\<`T`\>(`url`, `endpoint`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [clients/ep/baseClient.ts:221](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/clients/ep/baseClient.ts#L221)

Executes the HTTP fetch with timeout/abort support.

#### Type Parameters

##### T

`T`

#### Parameters

##### url

`URL`

##### endpoint

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

***

### get()

> `protected` **get**\<`T`\>(`endpoint`, `params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [clients/ep/baseClient.ts:290](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/clients/ep/baseClient.ts#L290)

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

***

### getCacheKey()

> `private` **getCacheKey**(`endpoint`, `params?`): `string`

Defined in: [clients/ep/baseClient.ts:328](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/clients/ep/baseClient.ts#L328)

Generates a deterministic cache key.

#### Parameters

##### endpoint

`string`

API endpoint path

##### params?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Optional query parameters

#### Returns

`string`

JSON string used as cache key

***

### getCacheStats()

> **getCacheStats**(): `object`

Defined in: [clients/ep/baseClient.ts:350](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/clients/ep/baseClient.ts#L350)

Returns cache statistics for monitoring and debugging.

#### Returns

`object`

`{ size, maxSize, hitRate }`

##### hitRate

> **hitRate**: `number`

##### maxSize

> **maxSize**: `number`

##### size

> **size**: `number`

***

### shouldRetryRequest()

> `private` **shouldRetryRequest**(`error`): `boolean`

Defined in: [clients/ep/baseClient.ts:211](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/clients/ep/baseClient.ts#L211)

Returns true when an error should trigger a retry.

#### Parameters

##### error

`unknown`

#### Returns

`boolean`

***

### toAPIError()

> `private` **toAPIError**(`error`, `endpoint`): [`APIError`](APIError.md)

Defined in: [clients/ep/baseClient.ts:265](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/clients/ep/baseClient.ts#L265)

Converts a caught error to a typed [APIError](APIError.md).

#### Parameters

##### error

`unknown`

##### endpoint

`string`

#### Returns

[`APIError`](APIError.md)
