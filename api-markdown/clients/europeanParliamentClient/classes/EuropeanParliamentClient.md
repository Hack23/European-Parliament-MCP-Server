[**European Parliament MCP Server API v0.7.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [clients/europeanParliamentClient](../README.md) / EuropeanParliamentClient

# Class: EuropeanParliamentClient

Defined in: [clients/europeanParliamentClient.ts:288](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L288)

European Parliament API Client.

Provides type-safe, high-performance access to the European Parliament Open Data Portal
with comprehensive caching, rate limiting, and GDPR-compliant audit logging.

**Performance Targets:**
- P50 latency: <100ms (cached responses)
- P95 latency: <200ms (cached responses)
- P99 latency: <2000ms (uncached API calls)

**Features:**
- LRU caching with 15-minute TTL (500 entry max)
- Token bucket rate limiting (100 requests/minute)
- GDPR Article 30 compliant audit logging
- Automatic JSON-LD to internal format transformation
- Type-safe API with branded types

**Configuration:**
- Base URL: https://data.europarl.europa.eu/api/v2/
- Cache: 15 min TTL, LRU eviction, 500 entry max
- Rate Limit: 100 requests per minute
- Audit Logging: All personal data access logged

**ISMS Policy Compliance:**
- SC-002: Secure coding with input validation and error handling
- PE-001: Performance monitoring and optimization (<200ms P95)
- AU-002: Comprehensive audit logging for GDPR compliance
- DP-001: Data protection and privacy by design

## Examples

```typescript
// Create client with default configuration
const client = new EuropeanParliamentClient();

// Fetch Swedish MEPs
const meps = await client.getMEPs({ country: 'SE', limit: 20 });
console.log(`Found ${meps.total} Swedish MEPs`);
```

```typescript
// Custom configuration with extended cache
const client = new EuropeanParliamentClient({
  cacheTTL: 1000 * 60 * 30,  // 30 minutes
  maxCacheSize: 1000,
  rateLimiter: new RateLimiter({
    tokensPerInterval: 50,
    interval: 'minute'
  })
});

// Get MEP details with caching
const mepDetails = await client.getMEPDetails('person/124936');
console.log(`${mepDetails.name} - ${mepDetails.country}`);
```

```typescript
// Error handling with rate limiting
try {
  const sessions = await client.getPlenarySessions({
    dateFrom: '2024-01-01',
    limit: 50
  });
} catch (error) {
  if (error instanceof APIError) {
    if (error.statusCode === 429) {
      console.error('Rate limit exceeded, retry later');
    } else {
      console.error(`API Error: ${error.message}`);
    }
  }
}
```

## Security

- All personal data access is audit logged per GDPR Article 30
- Rate limiting prevents API abuse and DoS attacks
- No credentials stored (EP API is public)
- Cache entries sanitized to prevent injection attacks
- TLS 1.3 enforced for all API communications

## See

 - https://data.europarl.europa.eu/api/v2/ - EP Open Data Portal API
 - https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md
 - https://gdpr-info.eu/art-30-gdpr/ - GDPR Article 30

## Constructors

### Constructor

> **new EuropeanParliamentClient**(`config?`): `EuropeanParliamentClient`

Defined in: [clients/europeanParliamentClient.ts:364](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L364)

Creates a new European Parliament API client.

Initializes caching, rate limiting, and API configuration. Uses sensible
defaults optimized for typical MCP server usage patterns.

#### Parameters

##### config?

`EPClientConfig` = `{}`

Optional client configuration

#### Returns

`EuropeanParliamentClient`

#### Examples

```typescript
// Default configuration
const client = new EuropeanParliamentClient();
```

```typescript
// Custom cache configuration
const client = new EuropeanParliamentClient({
  cacheTTL: 1000 * 60 * 30,  // 30 minutes
  maxCacheSize: 1000
});
```

## Properties

### baseURL

> `private` `readonly` **baseURL**: `string`

Defined in: [clients/europeanParliamentClient.ts:303](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L303)

European Parliament API base URL.

#### Default

```ts
'https://data.europarl.europa.eu/api/v2/'
```

***

### cache

> `private` `readonly` **cache**: `LRUCache`\<`string`, [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>

Defined in: [clients/europeanParliamentClient.ts:295](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L295)

LRU cache for API responses.
Stores transformed responses with 15-minute TTL.

***

### enableRetry

> `private` `readonly` **enableRetry**: `boolean`

Defined in: [clients/europeanParliamentClient.ts:327](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L327)

Enable automatic retry on transient failures.

#### Default

```ts
true
```

***

### maxRetries

> `private` `readonly` **maxRetries**: `number`

Defined in: [clients/europeanParliamentClient.ts:335](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L335)

Maximum number of retry attempts.

#### Default

```ts
2
```

***

### rateLimiter

> `private` `readonly` **rateLimiter**: [`RateLimiter`](../../../utils/rateLimiter/classes/RateLimiter.md)

Defined in: [clients/europeanParliamentClient.ts:311](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L311)

Token bucket rate limiter.
Enforces 100 requests per minute limit.

***

### timeoutMs

> `private` `readonly` **timeoutMs**: `number`

Defined in: [clients/europeanParliamentClient.ts:319](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L319)

Request timeout in milliseconds.

#### Default

```ts
10000 (10 seconds)
```

## Methods

### buildDocumentSearchParams()

> `private` **buildDocumentSearchParams**(`params`): [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Defined in: [clients/europeanParliamentClient.ts:1622](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L1622)

Builds EP API parameters for document search.

#### Parameters

##### params

Search parameters

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

EP API compatible parameters

***

### buildQuestionResult()

> `private` **buildQuestionResult**(`fields`, `topicText`, `hasAnswer`): [`ParliamentaryQuestion`](../../../europeanParliament/interfaces/ParliamentaryQuestion.md)

Defined in: [clients/europeanParliamentClient.ts:2094](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2094)

Builds a ParliamentaryQuestion result object.

#### Parameters

##### fields

###### author

`string`

###### date

`string`

###### id

`string`

###### type

`"WRITTEN"` \| `"ORAL"`

##### topicText

`string`

##### hasAnswer

`boolean`

#### Returns

[`ParliamentaryQuestion`](../../../europeanParliament/interfaces/ParliamentaryQuestion.md)

***

### buildQuestionSearchParams()

> `private` **buildQuestionSearchParams**(`params`): [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Defined in: [clients/europeanParliamentClient.ts:2151](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2151)

Builds EP API parameters for parliamentary question search.

#### Parameters

##### params

Search parameters

###### dateFrom?

`string`

###### limit?

`number`

###### offset?

`number`

###### type?

`"WRITTEN"` \| `"ORAL"`

#### Returns

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

EP API compatible parameters

***

### clearCache()

> **clearCache**(): `void`

Defined in: [clients/europeanParliamentClient.ts:2331](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2331)

Clears all entries from the LRU cache.

Removes all cached API responses, forcing subsequent requests to fetch
fresh data from European Parliament API. Useful for testing, debugging,
or forcing cache refresh.

**Use Cases:**
- Testing: Reset cache state between test cases
- Debugging: Verify behavior without cache
- Admin: Force refresh of stale data

#### Returns

`void`

#### Examples

```typescript
// Clear cache before critical operation
client.clearCache();
const freshData = await client.getMEPs({ country: 'SE' });
```

```typescript
// Clear cache in test teardown
afterEach(() => {
  client.clearCache();
});
```

***

### determineVoteOutcome()

> `private` **determineVoteOutcome**(`decisionStr`, `votesFor`, `votesAgainst`): `"ADOPTED"` \| `"REJECTED"`

Defined in: [clients/europeanParliamentClient.ts:1314](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L1314)

Determines vote outcome from decision string or vote counts.

#### Parameters

##### decisionStr

`string`

Decision outcome string from EP API

##### votesFor

`number`

Number of votes in favor

##### votesAgainst

`number`

Number of votes against

#### Returns

`"ADOPTED"` \| `"REJECTED"`

'ADOPTED' or 'REJECTED'

***

### extractAuthorId()

> `private` **extractAuthorId**(`authorField`): `string`

Defined in: [clients/europeanParliamentClient.ts:2133](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2133)

Extracts an author/person ID from EP API author field.

#### Parameters

##### authorField

`unknown`

Raw author field (string, array, or object)

#### Returns

`string`

Author identifier string

***

### extractDocumentRefs()

> `private` **extractDocumentRefs**(`docs`): `string`[]

Defined in: [clients/europeanParliamentClient.ts:3365](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L3365)

Extracts document reference IDs from an array-like field.

#### Parameters

##### docs

`unknown`

Documents field from API (string, array, or object)

#### Returns

`string`[]

Array of document reference strings

***

### extractField()

> `private` **extractField**(`data`, `fields`): `string`

Defined in: [clients/europeanParliamentClient.ts:1583](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L1583)

Extracts a string value from the first matching field name.

#### Parameters

##### data

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Record to search

##### fields

`string`[]

Field names to try in order

#### Returns

`string`

String value from first matching field or empty string

***

### fetchCommitteeDirectly()

> `private` **fetchCommitteeDirectly**(`bodyId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Committee`](../../../europeanParliament/interfaces/Committee.md) \| `null`\>

Defined in: [clients/europeanParliamentClient.ts:2019](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2019)

Attempts to fetch a committee directly by body ID.

#### Parameters

##### bodyId

`string`

Corporate body identifier

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Committee`](../../../europeanParliament/interfaces/Committee.md) \| `null`\>

Committee or null if not found

***

### fetchVoteResultsForSession()

> `private` **fetchVoteResultsForSession**(`sessionId`, `apiParams`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`VotingRecord`](../../../europeanParliament/interfaces/VotingRecord.md)[]\>

Defined in: [clients/europeanParliamentClient.ts:1465](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L1465)

Fetches vote results for a specific sitting/session.

#### Parameters

##### sessionId

`string`

Sitting identifier

##### apiParams

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Query parameters

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`VotingRecord`](../../../europeanParliament/interfaces/VotingRecord.md)[]\>

Array of VotingRecord

***

### fetchVoteResultsFromRecentMeetings()

> `private` **fetchVoteResultsFromRecentMeetings**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`VotingRecord`](../../../europeanParliament/interfaces/VotingRecord.md)[]\>

Defined in: [clients/europeanParliamentClient.ts:1482](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L1482)

Fetches vote results from recent meetings when no sessionId is given.

#### Parameters

##### params

Original query parameters

###### dateFrom?

`string`

###### limit?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`VotingRecord`](../../../europeanParliament/interfaces/VotingRecord.md)[]\>

Array of VotingRecord

***

### filterDocuments()

> `private` **filterDocuments**(`documents`, `params`): [`LegislativeDocument`](../../../europeanParliament/interfaces/LegislativeDocument.md)[]

Defined in: [clients/europeanParliamentClient.ts:1653](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L1653)

Applies client-side filters to documents.

#### Parameters

##### documents

[`LegislativeDocument`](../../../europeanParliament/interfaces/LegislativeDocument.md)[]

Documents to filter

##### params

Filter parameters

###### committee?

`string`

###### keyword?

`string`

#### Returns

[`LegislativeDocument`](../../../europeanParliament/interfaces/LegislativeDocument.md)[]

Filtered documents

***

### filterQuestions()

> `private` **filterQuestions**(`questions`, `params`): [`ParliamentaryQuestion`](../../../europeanParliament/interfaces/ParliamentaryQuestion.md)[]

Defined in: [clients/europeanParliamentClient.ts:2175](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2175)

Applies client-side filters to parliamentary questions.

#### Parameters

##### questions

[`ParliamentaryQuestion`](../../../europeanParliament/interfaces/ParliamentaryQuestion.md)[]

Questions to filter

##### params

Filter parameters

###### author?

`string`

###### status?

`"PENDING"` \| `"ANSWERED"`

###### topic?

`string`

#### Returns

[`ParliamentaryQuestion`](../../../europeanParliament/interfaces/ParliamentaryQuestion.md)[]

Filtered questions

***

### filterVotingRecords()

> `private` **filterVotingRecords**(`records`, `params`): [`VotingRecord`](../../../europeanParliament/interfaces/VotingRecord.md)[]

Defined in: [clients/europeanParliamentClient.ts:1519](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L1519)

Applies client-side filters to voting records.

#### Parameters

##### records

[`VotingRecord`](../../../europeanParliament/interfaces/VotingRecord.md)[]

Records to filter

##### params

Filter parameters

###### dateFrom?

`string`

###### dateTo?

`string`

###### topic?

`string`

#### Returns

[`VotingRecord`](../../../europeanParliament/interfaces/VotingRecord.md)[]

Filtered records

***

### firstDefined()

> `private` **firstDefined**(`data`, ...`keys`): `unknown`

Defined in: [clients/europeanParliamentClient.ts:3277](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L3277)

Returns first defined value from named fields in apiData.

#### Parameters

##### data

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Record to search

##### keys

...`string`[]

Field names to try in order

#### Returns

`unknown`

First defined value or empty string

***

### get()

> `private` **get**\<`T`\>(`endpoint`, `params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [clients/europeanParliamentClient.ts:439](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L439)

Executes generic GET request with caching and rate limiting.

Internal method handling all HTTP GET requests to EP API. Implements:
- Token bucket rate limiting (100 req/min)
- LRU caching with 15-minute TTL
- JSON-LD Accept header
- Error handling and transformation

**Caching Strategy:**
- Cache key: JSON.stringify({ endpoint, params })
- TTL: 15 minutes (configurable)
- Eviction: LRU when max size reached

**Rate Limiting:**
- Token bucket algorithm
- 100 tokens per minute (default)
- Blocks until token available

**Performance:**
- Cached: <100ms (P50), <200ms (P95)
- Uncached: <2s (P99), depends on EP API

#### Type Parameters

##### T

`T` *extends* [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Expected response type (extends Record<string, unknown>)

#### Parameters

##### endpoint

`string`

API endpoint path (relative to baseURL)

##### params?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Optional query parameters for URL

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Promise resolving to typed API response

#### Throws

When API request fails (network, HTTP error, invalid JSON)

#### Throws

When rate limit exceeded and no tokens available

#### Examples

```typescript
// Basic GET request
const response = await this.get<JSONLDResponse>('meps', { limit: 50 });
```

```typescript
// With query parameters
const response = await this.get<JSONLDResponse>('meetings', {
  'date-from': '2024-01-01',
  'date-to': '2024-12-31',
  limit: 100
});
```

#### Performance

Cached responses: <100ms P50, <200ms P95. Uncached: <2s P99

#### See

 - getCacheKey for cache key generation
 - https://data.europarl.europa.eu/api/v2/ - EP API documentation

***

### getAdoptedTextById()

> **getAdoptedTextById**(`docId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`AdoptedText`](../../../europeanParliament/interfaces/AdoptedText.md)\>

Defined in: [clients/europeanParliamentClient.ts:3005](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L3005)

Returns a single adopted text by document ID.

**EP API Endpoint:** `GET /adopted-texts/{doc-id}`

#### Parameters

##### docId

`string`

Document identifier

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`AdoptedText`](../../../europeanParliament/interfaces/AdoptedText.md)\>

Single adopted text

***

### getAdoptedTexts()

> **getAdoptedTexts**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`AdoptedText`](../../../europeanParliament/interfaces/AdoptedText.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:2554](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2554)

Returns adopted texts.

**EP API Endpoint:** `GET /adopted-texts`

#### Parameters

##### params?

Search and pagination parameters

###### limit?

`number`

###### offset?

`number`

###### year?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`AdoptedText`](../../../europeanParliament/interfaces/AdoptedText.md)\>\>

Paginated list of adopted texts

***

### getCacheStats()

> **getCacheStats**(): `object`

Defined in: [clients/europeanParliamentClient.ts:2371](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2371)

Retrieves cache statistics for monitoring and debugging.

Returns current cache size, maximum capacity, and hit rate metrics.
Useful for performance monitoring, capacity planning, and debugging
cache behavior.

**Metrics:**
- `size`: Current number of cached entries
- `maxSize`: Maximum cache capacity
- `hitRate`: Cache hit rate (currently 0, not tracked by LRUCache)

#### Returns

`object`

Object containing cache statistics

##### hitRate

> **hitRate**: `number`

##### maxSize

> **maxSize**: `number`

##### size

> **size**: `number`

#### Examples

```typescript
// Monitor cache usage
const stats = client.getCacheStats();
console.log(`Cache: ${stats.size}/${stats.maxSize} entries`);
console.log(`Utilization: ${(stats.size / stats.maxSize * 100).toFixed(1)}%`);
```

```typescript
// Check cache capacity
const stats = client.getCacheStats();
if (stats.size === stats.maxSize) {
  console.warn('Cache at capacity, consider increasing maxCacheSize');
}
```

***

### getCommitteeDocumentById()

> **getCommitteeDocumentById**(`docId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../europeanParliament/interfaces/LegislativeDocument.md)\>

Defined in: [clients/europeanParliamentClient.ts:3041](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L3041)

Returns a single committee document by ID.

**EP API Endpoint:** `GET /committee-documents/{doc-id}`

#### Parameters

##### docId

`string`

Document identifier

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../europeanParliament/interfaces/LegislativeDocument.md)\>

Single committee document

***

### getCommitteeDocuments()

> **getCommitteeDocuments**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../europeanParliament/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:2745](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2745)

Returns committee documents.

**EP API Endpoint:** `GET /committee-documents`

#### Parameters

##### params?

Search and pagination parameters

###### limit?

`number`

###### offset?

`number`

###### year?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../europeanParliament/interfaces/LegislativeDocument.md)\>\>

Paginated list of committee documents

***

### getCommitteeInfo()

> **getCommitteeInfo**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Committee`](../../../europeanParliament/interfaces/Committee.md)\>

Defined in: [clients/europeanParliamentClient.ts:1973](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L1973)

Retrieves committee (corporate body) information by ID or abbreviation.

Fetches detailed committee information from the European Parliament API
using the `/corporate-bodies/{body-id}` endpoint for specific lookups or
`/corporate-bodies` for listing. Supports committee classification filtering.

**EP API Endpoint:** `GET /corporate-bodies/{body-id}` or `GET /corporate-bodies`

**Body Classifications:**
- `COMMITTEE_PARLIAMENTARY_STANDING` - Standing committees
- `COMMITTEE_PARLIAMENTARY_TEMPORARY` - Temporary committees
- `COMMITTEE_PARLIAMENTARY_SPECIAL` - Special committees
- `COMMITTEE_PARLIAMENTARY_SUB` - Subcommittees
- `EU_POLITICAL_GROUP` - Political groups
- `DELEGATION_PARLIAMENTARY` - Delegations

**Performance:**
- Cached: <100ms (P50), <200ms (P95)
- Uncached: <2s (P99)

#### Parameters

##### params

Query parameters for committee lookup

###### abbreviation?

`string`

Committee abbreviation (e.g., "ENVI", "DEVE")

###### id?

`string`

Committee/corporate body identifier (e.g., "ENVI")

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Committee`](../../../europeanParliament/interfaces/Committee.md)\>

Promise resolving to committee information

#### Throws

When neither id nor abbreviation provided

#### Throws

When committee not found (HTTP 404)

#### Examples

```typescript
// Get committee by abbreviation
const committee = await client.getCommitteeInfo({
  abbreviation: 'ENVI'
});

console.log(`${committee.name} (${committee.abbreviation})`);
console.log(`Members: ${committee.members.length}`);
```

```typescript
// Get committee by ID
const committee = await client.getCommitteeInfo({
  id: 'ENVI'
});
console.log(`Chair: ${committee.chair}`);
```

#### Security

Audit logged per GDPR Article 30

#### Performance

Cached: <100ms P50, <200ms P95. Uncached: <2s P99

#### See

 - [Committee](../../../europeanParliament/interfaces/Committee.md) for committee data structure
 - https://data.europarl.europa.eu/api/v2/corporate-bodies - EP API endpoint

***

### getControlledVocabularies()

> **getControlledVocabularies**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:2803](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2803)

Returns EP controlled vocabularies.

**EP API Endpoint:** `GET /controlled-vocabularies`

#### Parameters

##### params?

Pagination parameters

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Raw API response with vocabulary items

***

### getControlledVocabularyById()

> **getControlledVocabularyById**(`vocId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>

Defined in: [clients/europeanParliamentClient.ts:3189](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L3189)

Returns a single EP Controlled Vocabulary by ID.

**EP API Endpoint:** `GET /controlled-vocabularies/{voc-id}`

#### Parameters

##### vocId

`string`

Vocabulary identifier

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>

Single vocabulary entry

***

### getCurrentCorporateBodies()

> **getCurrentCorporateBodies**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`Committee`](../../../europeanParliament/interfaces/Committee.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:2862](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2862)

Returns the list of all current EP Corporate Bodies for today's date.

**EP API Endpoint:** `GET /corporate-bodies/show-current`

#### Parameters

##### params?

Pagination parameters

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`Committee`](../../../europeanParliament/interfaces/Committee.md)\>\>

Paginated list of current corporate bodies

***

### getCurrentMEPs()

> **getCurrentMEPs**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`MEP`](../../../europeanParliament/interfaces/MEP.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:2391](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2391)

Returns the list of all currently active MEPs for today's date.

**EP API Endpoint:** `GET /meps/show-current`

#### Parameters

##### params?

Pagination parameters

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`MEP`](../../../europeanParliament/interfaces/MEP.md)\>\>

Paginated list of active MEPs

***

### getDocumentById()

> **getDocumentById**(`docId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../europeanParliament/interfaces/LegislativeDocument.md)\>

Defined in: [clients/europeanParliamentClient.ts:3023](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L3023)

Returns a single document by ID.

**EP API Endpoint:** `GET /documents/{doc-id}`

#### Parameters

##### docId

`string`

Document identifier

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../europeanParliament/interfaces/LegislativeDocument.md)\>

Single document

***

### getEventById()

> **getEventById**(`eventId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`EPEvent`](../../../europeanParliament/interfaces/EPEvent.md)\>

Defined in: [clients/europeanParliamentClient.ts:2889](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2889)

Returns a single EP event by ID.

**EP API Endpoint:** `GET /events/{event-id}`

#### Parameters

##### eventId

`string`

Event identifier

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`EPEvent`](../../../europeanParliament/interfaces/EPEvent.md)\>

Single EP event

***

### getEvents()

> **getEvents**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`EPEvent`](../../../europeanParliament/interfaces/EPEvent.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:2585](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2585)

Returns EP events (hearings, conferences, etc.).

**EP API Endpoint:** `GET /events`

#### Parameters

##### params?

Search and pagination parameters

###### dateFrom?

`string`

###### dateTo?

`string`

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`EPEvent`](../../../europeanParliament/interfaces/EPEvent.md)\>\>

Paginated list of events

***

### getExternalDocumentById()

> **getExternalDocumentById**(`docId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../europeanParliament/interfaces/LegislativeDocument.md)\>

Defined in: [clients/europeanParliamentClient.ts:3171](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L3171)

Returns a single external document by ID.

**EP API Endpoint:** `GET /external-documents/{doc-id}`

#### Parameters

##### docId

`string`

Document identifier

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../europeanParliament/interfaces/LegislativeDocument.md)\>

Single external document

***

### getExternalDocuments()

> **getExternalDocuments**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../europeanParliament/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:3140](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L3140)

Returns the list of all External Documents.

**EP API Endpoint:** `GET /external-documents`

#### Parameters

##### params?

Search and pagination parameters

###### limit?

`number`

###### offset?

`number`

###### year?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../europeanParliament/interfaces/LegislativeDocument.md)\>\>

Paginated list of external documents

***

### getHomonymMEPs()

> **getHomonymMEPs**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`MEP`](../../../europeanParliament/interfaces/MEP.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:2835](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2835)

Returns the list of all homonym MEPs for the current parliamentary term.

**EP API Endpoint:** `GET /meps/show-homonyms`

#### Parameters

##### params?

Pagination parameters

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`MEP`](../../../europeanParliament/interfaces/MEP.md)\>\>

Paginated list of homonym MEPs

***

### getIncomingMEPs()

> **getIncomingMEPs**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`MEP`](../../../europeanParliament/interfaces/MEP.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:2418](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2418)

Returns the list of all incoming MEPs for the current parliamentary term.

**EP API Endpoint:** `GET /meps/show-incoming`

#### Parameters

##### params?

Pagination parameters

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`MEP`](../../../europeanParliament/interfaces/MEP.md)\>\>

Paginated list of incoming MEPs

***

### getMeetingActivities()

> **getMeetingActivities**(`sittingId`, `params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`MeetingActivity`](../../../europeanParliament/interfaces/MeetingActivity.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:2619](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2619)

Returns activities linked to a specific meeting (plenary sitting).

**EP API Endpoint:** `GET /meetings/{sitting-id}/activities`

#### Parameters

##### sittingId

`string`

Meeting / sitting identifier

##### params?

Pagination parameters

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`MeetingActivity`](../../../europeanParliament/interfaces/MeetingActivity.md)\>\>

Paginated list of meeting activities

***

### getMeetingById()

> **getMeetingById**(`eventId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PlenarySession`](../../../europeanParliament/interfaces/PlenarySession.md)\>

Defined in: [clients/europeanParliamentClient.ts:2907](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2907)

Returns a single EP meeting by ID.

**EP API Endpoint:** `GET /meetings/{event-id}`

#### Parameters

##### eventId

`string`

Meeting event identifier

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PlenarySession`](../../../europeanParliament/interfaces/PlenarySession.md)\>

Single meeting as plenary session

***

### getMeetingDecisions()

> **getMeetingDecisions**(`sittingId`, `params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../europeanParliament/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:2650](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2650)

Returns decisions made in a specific meeting (plenary sitting).

**EP API Endpoint:** `GET /meetings/{sitting-id}/decisions`

#### Parameters

##### sittingId

`string`

Meeting / sitting identifier

##### params?

Pagination parameters

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../europeanParliament/interfaces/LegislativeDocument.md)\>\>

Paginated list of meeting decisions (as generic documents)

***

### getMeetingForeseenActivities()

> **getMeetingForeseenActivities**(`sittingId`, `params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`MeetingActivity`](../../../europeanParliament/interfaces/MeetingActivity.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:2926](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2926)

Returns foreseen activities linked to a specific meeting (plenary sitting).

**EP API Endpoint:** `GET /meetings/{sitting-id}/foreseen-activities`

#### Parameters

##### sittingId

`string`

Meeting / sitting identifier

##### params?

Pagination parameters

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`MeetingActivity`](../../../europeanParliament/interfaces/MeetingActivity.md)\>\>

Paginated list of foreseen meeting activities

***

### getMEPDeclarationById()

> **getMEPDeclarationById**(`docId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MEPDeclaration`](../../../europeanParliament/interfaces/MEPDeclaration.md)\>

Defined in: [clients/europeanParliamentClient.ts:3208](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L3208)

Returns a single MEP declaration by document ID.

**EP API Endpoint:** `GET /meps-declarations/{doc-id}`

#### Parameters

##### docId

`string`

Document identifier

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MEPDeclaration`](../../../europeanParliament/interfaces/MEPDeclaration.md)\>

Single MEP declaration

#### Gdpr

Declarations contain personal financial data – access is audit-logged

***

### getMEPDeclarations()

> **getMEPDeclarations**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`MEPDeclaration`](../../../europeanParliament/interfaces/MEPDeclaration.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:2681](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2681)

Returns MEP declarations of financial interests.

**EP API Endpoint:** `GET /meps-declarations`

#### Parameters

##### params?

Search and pagination parameters

###### limit?

`number`

###### offset?

`number`

###### year?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`MEPDeclaration`](../../../europeanParliament/interfaces/MEPDeclaration.md)\>\>

Paginated list of MEP declarations

#### Gdpr

Declarations contain personal financial data – access is audit-logged

***

### getMEPDetails()

> **getMEPDetails**(`id`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MEPDetails`](../../../europeanParliament/interfaces/MEPDetails.md)\>

Defined in: [clients/europeanParliamentClient.ts:1071](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L1071)

Retrieves detailed information about a specific Member of European Parliament.

Fetches comprehensive MEP data including biography, committee memberships,
voting statistics, and contact information. Supports multiple ID formats
with automatic normalization.

**Supported ID Formats:**
- Numeric: `"124936"`
- Person URI: `"person/124936"`
- MEP prefix: `"MEP-124936"`

**Performance:**
- Cached: <100ms (P50), <200ms (P95)
- Uncached: <2s (P99)

#### Parameters

##### id

`string`

MEP identifier in any supported format

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MEPDetails`](../../../europeanParliament/interfaces/MEPDetails.md)\>

Promise resolving to detailed MEP information

#### Throws

When ID format is invalid

#### Throws

When MEP not found (HTTP 404)

#### Throws

When rate limit exceeded (HTTP 429)

#### Throws

When EP API request fails

#### Examples

```typescript
// Get MEP details with numeric ID
const mep = await client.getMEPDetails('124936');
console.log(`${mep.name} - ${mep.country}`);
console.log(`Committees: ${mep.committees.join(', ')}`);
console.log(`Biography: ${mep.biography}`);
```

```typescript
// Get MEP details with person URI
const mep = await client.getMEPDetails('person/124936');
console.log(`Voting statistics:`);
console.log(`  Total votes: ${mep.votingStatistics.totalVotes}`);
console.log(`  Attendance: ${mep.votingStatistics.attendanceRate}%`);
```

```typescript
// Error handling for not found
try {
  const mep = await client.getMEPDetails('999999');
} catch (error) {
  if (error instanceof APIError && error.statusCode === 404) {
    console.error('MEP not found');
  } else {
    console.error('API error:', error.message);
  }
}
```

#### Security

- Personal data access logged per GDPR Article 30
- Contact information (email, phone) flagged as GDPR-protected
- Audit log includes: action='get_mep_details', id, timestamp
- Access count tracked for compliance reporting

#### Performance

Cached: <100ms P50, <200ms P95. Uncached: <2s P99

#### See

 - [MEPDetails](../../../europeanParliament/interfaces/MEPDetails.md) for detailed MEP data structure
 - [MEP](../../../europeanParliament/interfaces/MEP.md) for basic MEP structure
 - https://data.europarl.europa.eu/api/v2/meps/{id} - EP API endpoint

***

### getMEPs()

> **getMEPs**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`MEP`](../../../europeanParliament/interfaces/MEP.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:950](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L950)

Retrieves Members of the European Parliament with filtering and pagination.

Fetches MEP data from European Parliament Open Data Portal with support
for country, political group, and committee filters. Implements LRU caching
(15 min TTL) and rate limiting (100 req/min) for optimal performance.

**Performance:**
- Cached: <100ms (P50), <200ms (P95)
- Uncached: <2s (P99)

**Caching:**
- Cache Key: Based on endpoint + params
- TTL: 15 minutes
- Strategy: LRU eviction when max size reached

**Rate Limiting:**
- Token Bucket: 100 requests/minute
- Automatic retry: Not implemented (client should handle)

#### Parameters

##### params

Query parameters for filtering MEPs

###### active?

`boolean`

Filter by active status (default: all)

###### committee?

`string`

Committee abbreviation (e.g., "ENVI", "DEVE")

###### country?

`string`

ISO 3166-1 alpha-2 country code (e.g., "SE", "DE", "FR")

###### group?

`string`

Political group identifier (e.g., "EPP", "S&D")

###### limit?

`number`

Maximum results to return (1-100, default: 50)

###### offset?

`number`

Pagination offset (default: 0)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`MEP`](../../../europeanParliament/interfaces/MEP.md)\>\>

Promise resolving to paginated MEP list with metadata

#### Throws

When parameters fail validation (HTTP 400)

#### Throws

When rate limit exceeded (HTTP 429)

#### Throws

When EP API request fails (network, HTTP, parsing)

#### Examples

```typescript
// Get Swedish MEPs with basic filtering
const result = await client.getMEPs({ country: "SE", limit: 20 });
console.log(`Found ${result.total} Swedish MEPs`);

for (const mep of result.data) {
  console.log(`${mep.name} (${mep.politicalGroup})`);
}
```

```typescript
// Paginate through all results
let offset = 0;
const limit = 50;

do {
  const result = await client.getMEPs({ limit, offset });
  processBatch(result.data);
  offset += limit;
} while (result.hasMore);
```

```typescript
// Error handling with rate limiting
try {
  const meps = await client.getMEPs({ country: "SE" });
} catch (error) {
  if (error instanceof RateLimitError) {
    console.error(`Rate limited. Retry after ${error.retryAfter}s`);
    await sleep(error.retryAfter * 1000);
    return await client.getMEPs({ country: "SE" });
  } else if (error instanceof APIError) {
    console.error(`API Error (${error.statusCode}): ${error.message}`);
  }
  throw error;
}
```

#### Security

- Personal data access logged per GDPR Article 30
- Audit log includes: action, params (sanitized), result count, timestamp
- No PII logged (only metadata)
- Rate limiting prevents API abuse

#### Performance

Cached: <100ms P50, <200ms P95. Uncached: <2s P99

#### See

 - [MEP](../../../europeanParliament/interfaces/MEP.md) for MEP data structure
 - [PaginatedResponse](../../../europeanParliament/interfaces/PaginatedResponse.md) for response format
 - https://data.europarl.europa.eu/api/v2/meps - EP API endpoint

***

### getOutgoingMEPs()

> **getOutgoingMEPs**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`MEP`](../../../europeanParliament/interfaces/MEP.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:2445](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2445)

Returns the list of all outgoing MEPs for the current parliamentary term.

**EP API Endpoint:** `GET /meps/show-outgoing`

#### Parameters

##### params?

Pagination parameters

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`MEP`](../../../europeanParliament/interfaces/MEP.md)\>\>

Paginated list of outgoing MEPs

***

### getParliamentaryQuestionById()

> **getParliamentaryQuestionById**(`docId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ParliamentaryQuestion`](../../../europeanParliament/interfaces/ParliamentaryQuestion.md)\>

Defined in: [clients/europeanParliamentClient.ts:3059](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L3059)

Returns a single parliamentary question by document ID.

**EP API Endpoint:** `GET /parliamentary-questions/{doc-id}`

#### Parameters

##### docId

`string`

Document identifier

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ParliamentaryQuestion`](../../../europeanParliament/interfaces/ParliamentaryQuestion.md)\>

Single parliamentary question

***

### getParliamentaryQuestions()

> **getParliamentaryQuestions**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`ParliamentaryQuestion`](../../../europeanParliament/interfaces/ParliamentaryQuestion.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:2257](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2257)

Retrieves parliamentary questions with filtering by type, author, and status.

Fetches parliamentary questions from the European Parliament API using the
`/parliamentary-questions` endpoint. Supports filtering by question type
(written/oral), year, and work-type classification.

**EP API Endpoint:** `GET /parliamentary-questions`

**Supported work-type filters:**
- `QUESTION_WRITTEN_PRIORITY` - Priority written questions
- `QUESTION_WRITTEN` - Standard written questions
- `QUESTION_ORAL` - Oral questions
- `INTERPELLATION_MAJOR` - Major interpellations
- `INTERPELLATION_MINOR` - Minor interpellations
- `QUESTION_TIME` - Question time

**Performance:**
- Cached: <100ms (P50), <200ms (P95)
- Uncached: <2s (P99)

#### Parameters

##### params

Query parameters for filtering parliamentary questions

###### author?

`string`

MEP identifier who authored the question

###### dateFrom?

`string`

Start date (ISO 8601, e.g., "2024-01-01")

###### dateTo?

`string`

End date (ISO 8601, e.g., "2024-12-31")

###### limit?

`number`

Maximum results to return (1-100, default: 50)

###### offset?

`number`

Pagination offset (default: 0)

###### status?

`"PENDING"` \| `"ANSWERED"`

Question status ("PENDING" or "ANSWERED")

###### topic?

`string`

Topic or subject of the question

###### type?

`"WRITTEN"` \| `"ORAL"`

Question type ("WRITTEN" or "ORAL")

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`ParliamentaryQuestion`](../../../europeanParliament/interfaces/ParliamentaryQuestion.md)\>\>

Promise resolving to paginated parliamentary questions list

#### Throws

When parameters fail validation

#### Throws

When API request fails

#### Examples

```typescript
// Get written questions
const result = await client.getParliamentaryQuestions({
  type: 'WRITTEN',
  limit: 20
});

for (const question of result.data) {
  console.log(`Q: ${question.topic} (${question.status})`);
}
```

```typescript
// Get oral questions by year
const questions = await client.getParliamentaryQuestions({
  type: 'ORAL',
  dateFrom: '2024-01-01'
});
```

#### Security

Audit logged per GDPR Article 30

#### Performance

Cached: <100ms P50, <200ms P95. Uncached: <2s P99

#### See

 - [ParliamentaryQuestion](../../../europeanParliament/interfaces/ParliamentaryQuestion.md) for question data structure
 - [PaginatedResponse](../../../europeanParliament/interfaces/PaginatedResponse.md) for response format
 - https://data.europarl.europa.eu/api/v2/parliamentary-questions - EP API endpoint

***

### getPlenaryDocumentById()

> **getPlenaryDocumentById**(`docId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../europeanParliament/interfaces/LegislativeDocument.md)\>

Defined in: [clients/europeanParliamentClient.ts:3077](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L3077)

Returns a single plenary document by document ID.

**EP API Endpoint:** `GET /plenary-documents/{doc-id}`

#### Parameters

##### docId

`string`

Document identifier

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../europeanParliament/interfaces/LegislativeDocument.md)\>

Single plenary document

***

### getPlenaryDocuments()

> **getPlenaryDocuments**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../europeanParliament/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:2714](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2714)

Returns plenary documents.

**EP API Endpoint:** `GET /plenary-documents`

#### Parameters

##### params?

Search and pagination parameters

###### limit?

`number`

###### offset?

`number`

###### year?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../europeanParliament/interfaces/LegislativeDocument.md)\>\>

Paginated list of plenary documents

***

### getPlenarySessionDocumentById()

> **getPlenarySessionDocumentById**(`docId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../europeanParliament/interfaces/LegislativeDocument.md)\>

Defined in: [clients/europeanParliamentClient.ts:3095](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L3095)

Returns a single plenary session document by document ID.

**EP API Endpoint:** `GET /plenary-session-documents/{doc-id}`

#### Parameters

##### docId

`string`

Document identifier

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../europeanParliament/interfaces/LegislativeDocument.md)\>

Single plenary session document

***

### getPlenarySessionDocumentItems()

> **getPlenarySessionDocumentItems**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../europeanParliament/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:3113](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L3113)

Returns the list of all Plenary Session Documents Items.

**EP API Endpoint:** `GET /plenary-session-documents-items`

#### Parameters

##### params?

Pagination parameters

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../europeanParliament/interfaces/LegislativeDocument.md)\>\>

Paginated list of plenary session document items

***

### getPlenarySessionDocuments()

> **getPlenarySessionDocuments**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../europeanParliament/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:2776](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2776)

Returns plenary session documents.

**EP API Endpoint:** `GET /plenary-session-documents`

#### Parameters

##### params?

Pagination parameters

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../europeanParliament/interfaces/LegislativeDocument.md)\>\>

Paginated list of plenary session documents

***

### getPlenarySessions()

> **getPlenarySessions**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`PlenarySession`](../../../europeanParliament/interfaces/PlenarySession.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:1229](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L1229)

Retrieves plenary sessions with date and location filtering.

Fetches plenary session data from European Parliament API with support
for date range and location filters. Sessions include agenda items,
attendance counts, and associated documents.

**Performance:**
- Cached: <100ms (P50), <200ms (P95)
- Uncached: <2s (P99)

#### Parameters

##### params

Query parameters for filtering sessions

###### dateFrom?

`string`

Start date (ISO 8601, e.g., "2024-01-01")

###### dateTo?

`string`

End date (ISO 8601, e.g., "2024-12-31")

###### limit?

`number`

Maximum results to return (1-100, default: 50)

###### location?

`string`

Session location ("Strasbourg" or "Brussels")

###### offset?

`number`

Pagination offset (default: 0)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`PlenarySession`](../../../europeanParliament/interfaces/PlenarySession.md)\>\>

Promise resolving to paginated plenary session list

#### Throws

When date format is invalid (HTTP 400)

#### Throws

When rate limit exceeded (HTTP 429)

#### Throws

When EP API request fails

#### Examples

```typescript
// Get sessions for date range
const result = await client.getPlenarySessions({
  dateFrom: '2024-01-01',
  dateTo: '2024-03-31',
  limit: 20
});

console.log(`Found ${result.total} plenary sessions`);
for (const session of result.data) {
  console.log(`${session.date} - ${session.location}`);
  console.log(`  Attendance: ${session.attendanceCount}`);
}
```

```typescript
// Filter by location
const strasbourgSessions = await client.getPlenarySessions({
  location: 'Strasbourg',
  dateFrom: '2024-01-01',
  limit: 50
});
```

```typescript
// Paginate through all sessions
let offset = 0;
const allSessions = [];

do {
  const result = await client.getPlenarySessions({
    dateFrom: '2024-01-01',
    limit: 50,
    offset
  });
  allSessions.push(...result.data);
  offset += 50;
} while (result.hasMore);
```

#### Performance

Cached: <100ms P50, <200ms P95. Uncached: <2s P99

#### See

 - [PlenarySession](../../../europeanParliament/interfaces/PlenarySession.md) for session data structure
 - [PaginatedResponse](../../../europeanParliament/interfaces/PaginatedResponse.md) for response format
 - https://data.europarl.europa.eu/api/v2/meetings - EP API endpoint

***

### getProcedureById()

> **getProcedureById**(`processId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Procedure`](../../../europeanParliament/interfaces/Procedure.md)\>

Defined in: [clients/europeanParliamentClient.ts:2536](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2536)

Returns a single procedure by ID.

**EP API Endpoint:** `GET /procedures/{process-id}`

#### Parameters

##### processId

`string`

Procedure process ID

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Procedure`](../../../europeanParliament/interfaces/Procedure.md)\>

Single procedure

***

### getProcedureEvents()

> **getProcedureEvents**(`processId`, `params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`EPEvent`](../../../europeanParliament/interfaces/EPEvent.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:2975](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2975)

Returns events linked to a procedure.

**EP API Endpoint:** `GET /procedures/{process-id}/events`

#### Parameters

##### processId

`string`

Procedure process ID

##### params?

Pagination parameters

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`EPEvent`](../../../europeanParliament/interfaces/EPEvent.md)\>\>

Paginated list of procedure events

***

### getProcedures()

> **getProcedures**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`Procedure`](../../../europeanParliament/interfaces/Procedure.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:2505](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2505)

Returns legislative procedures.

**EP API Endpoint:** `GET /procedures`

#### Parameters

##### params?

Search and pagination parameters

###### limit?

`number`

###### offset?

`number`

###### year?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`Procedure`](../../../europeanParliament/interfaces/Procedure.md)\>\>

Paginated list of procedures

***

### getSpeechById()

> **getSpeechById**(`speechId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Speech`](../../../europeanParliament/interfaces/Speech.md)\>

Defined in: [clients/europeanParliamentClient.ts:2956](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2956)

Returns a single speech by ID.

**EP API Endpoint:** `GET /speeches/{speech-id}`

#### Parameters

##### speechId

`string`

Speech identifier

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Speech`](../../../europeanParliament/interfaces/Speech.md)\>

Single speech

***

### getSpeeches()

> **getSpeeches**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`Speech`](../../../europeanParliament/interfaces/Speech.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:2472](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2472)

Returns plenary speeches and speech-related activities.

**EP API Endpoint:** `GET /speeches`

#### Parameters

##### params?

Search and pagination parameters

###### dateFrom?

`string`

###### dateTo?

`string`

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`Speech`](../../../europeanParliament/interfaces/Speech.md)\>\>

Paginated list of speeches

***

### getVotingRecords()

> **getVotingRecords**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`VotingRecord`](../../../europeanParliament/interfaces/VotingRecord.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:1404](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L1404)

Retrieves voting records with filtering by session, MEP, topic, and date.

Fetches vote results from the European Parliament API using the
`/meetings/{sitting-id}/vote-results` endpoint. When a sessionId is provided,
fetches vote results for that specific sitting. Otherwise returns results
from recent sittings.

**EP API Endpoint:** `GET /meetings/{sitting-id}/vote-results`

**Performance:**
- Cached: <100ms (P50), <200ms (P95)
- Uncached: <2s (P99)

#### Parameters

##### params

Query parameters for filtering voting records

###### dateFrom?

`string`

Start date (ISO 8601, e.g., "2024-01-01")

###### dateTo?

`string`

End date (ISO 8601, e.g., "2024-12-31")

###### limit?

`number`

Maximum results to return (1-100, default: 50)

###### mepId?

`string`

MEP identifier to filter votes by specific MEP

###### offset?

`number`

Pagination offset (default: 0)

###### sessionId?

`string`

Plenary sitting identifier (e.g., "MTG-PL-2024-01-15")

###### topic?

`string`

Topic or subject to filter votes

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`VotingRecord`](../../../europeanParliament/interfaces/VotingRecord.md)\>\>

Promise resolving to paginated voting records list

#### Throws

When parameters fail validation

#### Throws

When API request fails

#### Examples

```typescript
// Get voting records for a specific sitting
const result = await client.getVotingRecords({
  sessionId: 'MTG-PL-2024-01-15',
  limit: 20
});

for (const vote of result.data) {
  console.log(`${vote.topic}: ${vote.result}`);
  console.log(`  For: ${vote.votesFor}, Against: ${vote.votesAgainst}`);
}
```

```typescript
// Get specific MEP's voting record
const votes = await client.getVotingRecords({
  mepId: 'person/124936',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});
```

#### Security

Audit logged per GDPR Article 30

#### Performance

Cached: <100ms P50, <200ms P95. Uncached: <2s P99

#### See

 - [VotingRecord](../../../europeanParliament/interfaces/VotingRecord.md) for voting record data structure
 - [PaginatedResponse](../../../europeanParliament/interfaces/PaginatedResponse.md) for response format
 - https://data.europarl.europa.eu/api/v2/meetings/{sitting-id}/vote-results - EP API endpoint

***

### mapDocumentStatus()

> `private` **mapDocumentStatus**(`rawStatus`): [`DocumentStatus`](../../../europeanParliament/type-aliases/DocumentStatus.md)

Defined in: [clients/europeanParliamentClient.ts:1611](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L1611)

Maps a raw status string to a valid DocumentStatus.

#### Parameters

##### rawStatus

`string`

Raw status string from EP API

#### Returns

[`DocumentStatus`](../../../europeanParliament/type-aliases/DocumentStatus.md)

Valid DocumentStatus

***

### mapDocumentType()

> `private` **mapDocumentType**(`rawType`): [`DocumentType`](../../../europeanParliament/type-aliases/DocumentType.md)

Defined in: [clients/europeanParliamentClient.ts:1599](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L1599)

Maps a raw work-type string to a valid DocumentType.

#### Parameters

##### rawType

`string`

Raw type string from EP API

#### Returns

[`DocumentType`](../../../europeanParliament/type-aliases/DocumentType.md)

Valid DocumentType

***

### mapQuestionType()

> `private` **mapQuestionType**(`workType`): `"WRITTEN"` \| `"ORAL"`

Defined in: [clients/europeanParliamentClient.ts:2120](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2120)

Maps work-type string to question type.

#### Parameters

##### workType

`string`

Raw work-type from EP API

#### Returns

`"WRITTEN"` \| `"ORAL"`

'WRITTEN' or 'ORAL'

***

### resolveCommittee()

> `private` **resolveCommittee**(`searchTerm`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Committee`](../../../europeanParliament/interfaces/Committee.md)\>

Defined in: [clients/europeanParliamentClient.ts:2001](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2001)

Resolves a committee by trying direct lookup then list search.

#### Parameters

##### searchTerm

`string`

Committee abbreviation or ID

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Committee`](../../../europeanParliament/interfaces/Committee.md)\>

Committee

#### Throws

If committee not found

***

### searchCommitteeInList()

> `private` **searchCommitteeInList**(`searchTerm`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Committee`](../../../europeanParliament/interfaces/Committee.md) \| `null`\>

Defined in: [clients/europeanParliamentClient.ts:2037](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L2037)

Searches the corporate bodies list for a matching committee.

#### Parameters

##### searchTerm

`string`

Abbreviation or ID to match

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Committee`](../../../europeanParliament/interfaces/Committee.md) \| `null`\>

Matching Committee or null

***

### searchDocuments()

> **searchDocuments**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../europeanParliament/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:1831](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L1831)

Searches legislative documents by keyword, type, date, and committee.

Fetches documents from the European Parliament API using the `/documents`
endpoint with support for work-type filtering, date ranges, and committee
assignment filtering.

**EP API Endpoint:** `GET /documents`

**Supported work-type values:**
- `REPORT_PLENARY` - Plenary reports
- `RESOLUTION_MOTION` - Resolution motions
- `TEXT_ADOPTED` - Adopted texts
- `AMENDMENT_LIST` - Amendment lists
- And others (see EP API documentation)

**Performance:**
- Cached: <100ms (P50), <200ms (P95)
- Uncached: <2s (P99)

#### Parameters

##### params

Query parameters for searching documents

###### keyword

`string`

Search keyword or phrase (required)

###### committee?

`string`

Committee abbreviation (e.g., "ENVI", "DEVE")

###### dateFrom?

`string`

Start date (ISO 8601, e.g., "2024-01-01")

###### dateTo?

`string`

End date (ISO 8601, e.g., "2024-12-31")

###### documentType?

`string`

Document type filter ("REPORT", "AMENDMENT", etc.)

###### limit?

`number`

Maximum results to return (1-100, default: 20)

###### offset?

`number`

Pagination offset (default: 0)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../europeanParliament/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../europeanParliament/interfaces/LegislativeDocument.md)\>\>

Promise resolving to paginated legislative documents list

#### Throws

When keyword is missing or invalid

#### Throws

When API request fails

#### Example

```typescript
// Search for climate-related documents
const result = await client.searchDocuments({
  keyword: 'climate change',
  documentType: 'REPORT',
  limit: 10
});

for (const doc of result.data) {
  console.log(`${doc.title} (${doc.type})`);
  console.log(`  Status: ${doc.status}`);
}
```

#### Security

Audit logged per GDPR Article 30

#### Performance

Cached: <100ms P50, <200ms P95. Uncached: <2s P99

#### See

 - [LegislativeDocument](../../../europeanParliament/interfaces/LegislativeDocument.md) for document data structure
 - [PaginatedResponse](../../../europeanParliament/interfaces/PaginatedResponse.md) for response format
 - https://data.europarl.europa.eu/api/v2/documents - EP API endpoint

***

### transformAdoptedText()

> `private` **transformAdoptedText**(`apiData`): [`AdoptedText`](../../../europeanParliament/interfaces/AdoptedText.md)

Defined in: [clients/europeanParliamentClient.ts:3290](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L3290)

Transforms EP API adopted text JSON-LD into AdoptedText type.

#### Parameters

##### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Raw API response data

#### Returns

[`AdoptedText`](../../../europeanParliament/interfaces/AdoptedText.md)

Transformed AdoptedText object

***

### transformEvent()

> `private` **transformEvent**(`apiData`): [`EPEvent`](../../../europeanParliament/interfaces/EPEvent.md)

Defined in: [clients/europeanParliamentClient.ts:3308](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L3308)

Transforms EP API event JSON-LD into EPEvent type.

#### Parameters

##### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Raw API response data

#### Returns

[`EPEvent`](../../../europeanParliament/interfaces/EPEvent.md)

Transformed EPEvent object

***

### transformMeetingActivity()

> `private` **transformMeetingActivity**(`apiData`): [`MeetingActivity`](../../../europeanParliament/interfaces/MeetingActivity.md)

Defined in: [clients/europeanParliamentClient.ts:3327](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L3327)

Transforms EP API meeting activity JSON-LD into MeetingActivity type.

#### Parameters

##### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Raw API response data

#### Returns

[`MeetingActivity`](../../../europeanParliament/interfaces/MeetingActivity.md)

Transformed MeetingActivity object

***

### transformMEPDeclaration()

> `private` **transformMEPDeclaration**(`apiData`): [`MEPDeclaration`](../../../europeanParliament/interfaces/MEPDeclaration.md)

Defined in: [clients/europeanParliamentClient.ts:3347](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L3347)

Transforms EP API MEP declaration JSON-LD into MEPDeclaration type.

#### Parameters

##### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Raw API response data

#### Returns

[`MEPDeclaration`](../../../europeanParliament/interfaces/MEPDeclaration.md)

Transformed MEPDeclaration object

***

### transformProcedure()

> `private` **transformProcedure**(`apiData`): [`Procedure`](../../../europeanParliament/interfaces/Procedure.md)

Defined in: [clients/europeanParliamentClient.ts:3249](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L3249)

Transforms EP API procedure JSON-LD into Procedure type.

#### Parameters

##### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Raw API response data

#### Returns

[`Procedure`](../../../europeanParliament/interfaces/Procedure.md)

Transformed Procedure object

***

### transformSpeech()

> `private` **transformSpeech**(`apiData`): [`Speech`](../../../europeanParliament/interfaces/Speech.md)

Defined in: [clients/europeanParliamentClient.ts:3229](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/clients/europeanParliamentClient.ts#L3229)

Transforms EP API speech JSON-LD into Speech type.

#### Parameters

##### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Raw API response data

#### Returns

[`Speech`](../../../europeanParliament/interfaces/Speech.md)

Transformed Speech object
