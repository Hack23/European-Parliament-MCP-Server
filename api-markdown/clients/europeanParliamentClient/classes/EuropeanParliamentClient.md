[**European Parliament MCP Server API v1.3.12**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [clients/europeanParliamentClient](../README.md) / EuropeanParliamentClient

# Class: EuropeanParliamentClient

Defined in: [clients/europeanParliamentClient.ts:144](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L144)

European Parliament API Client.

Provides type-safe, high-performance access to the European Parliament Open
Data Portal with comprehensive caching, rate limiting, and GDPR-compliant
audit logging.

**Architecture Note:** This class is a thin facade; all logic lives in the
bounded-context sub-clients under `src/clients/ep/`.  The facade owns the
shared LRU cache and rate-limiter and passes them to every sub-client so
they all operate within the same resource budget.

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

**ISMS Policy Compliance:**
- SC-002: Secure coding with input validation and error handling
- PE-001: Performance monitoring and optimization (<200ms P95)
- AU-002: Comprehensive audit logging for GDPR compliance
- DP-001: Data protection and privacy by design

## Example

```typescript
const client = new EuropeanParliamentClient();
const meps = await client.getMEPs({ country: 'SE', limit: 20 });
console.log(`Found ${meps.total} Swedish MEPs`);
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

Defined in: [clients/europeanParliamentClient.ts:162](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L162)

Creates a new European Parliament API client.

Builds shared LRU cache and rate-limiter, then wires all sub-clients
to use them so the whole facade operates within one resource budget.

#### Parameters

##### config?

[`EPClientConfig`](../../ep/baseClient/interfaces/EPClientConfig.md) = `{}`

Optional client configuration

#### Returns

`EuropeanParliamentClient`

## Properties

### committeeClient

> `private` `readonly` **committeeClient**: [`CommitteeClient`](../../ep/committeeClient/classes/CommitteeClient.md)

Defined in: [clients/europeanParliamentClient.ts:148](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L148)

***

### documentClient

> `private` `readonly` **documentClient**: [`DocumentClient`](../../ep/documentClient/classes/DocumentClient.md)

Defined in: [clients/europeanParliamentClient.ts:149](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L149)

***

### legislativeClient

> `private` `readonly` **legislativeClient**: [`LegislativeClient`](../../ep/legislativeClient/classes/LegislativeClient.md)

Defined in: [clients/europeanParliamentClient.ts:150](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L150)

***

### mepClient

> `private` `readonly` **mepClient**: [`MEPClient`](../../ep/mepClient/classes/MEPClient.md)

Defined in: [clients/europeanParliamentClient.ts:145](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L145)

***

### plenaryClient

> `private` `readonly` **plenaryClient**: [`PlenaryClient`](../../ep/plenaryClient/classes/PlenaryClient.md)

Defined in: [clients/europeanParliamentClient.ts:146](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L146)

***

### questionClient

> `private` `readonly` **questionClient**: [`QuestionClient`](../../ep/questionClient/classes/QuestionClient.md)

Defined in: [clients/europeanParliamentClient.ts:151](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L151)

***

### vocabularyClient

> `private` `readonly` **vocabularyClient**: [`VocabularyClient`](../../ep/vocabularyClient/classes/VocabularyClient.md)

Defined in: [clients/europeanParliamentClient.ts:152](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L152)

***

### votingClient

> `private` `readonly` **votingClient**: [`VotingClient`](../../ep/votingClient/classes/VotingClient.md)

Defined in: [clients/europeanParliamentClient.ts:147](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L147)

## Methods

### clearCache()

> **clearCache**(): `void`

Defined in: [clients/europeanParliamentClient.ts:220](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L220)

Clears all entries from the LRU cache.

#### Returns

`void`

#### Example

```typescript
client.clearCache();
const freshData = await client.getMEPs({ country: 'SE' });
```

***

### getAdoptedTextById()

> **getAdoptedTextById**(`docId`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`AdoptedText`](../../../types/ep/activities/interfaces/AdoptedText.md)\>

Defined in: [clients/europeanParliamentClient.ts:814](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L814)

Returns a single adopted text by document ID.
**EP API Endpoint:** `GET /adopted-texts/{doc-id}`

#### Parameters

##### docId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`AdoptedText`](../../../types/ep/activities/interfaces/AdoptedText.md)\>

***

### getAdoptedTexts()

> **getAdoptedTexts**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`AdoptedText`](../../../types/ep/activities/interfaces/AdoptedText.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:801](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L801)

Returns adopted texts.
**EP API Endpoint:** `GET /adopted-texts`

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`AdoptedText`](../../../types/ep/activities/interfaces/AdoptedText.md)\>\>

***

### getAdoptedTextsFeed()

> **getAdoptedTextsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:835](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L835)

Retrieves recently updated adopted texts via the feed endpoint.
**EP API Endpoint:** `GET /adopted-texts/feed`

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getCacheStats()

> **getCacheStats**(): `object`

Defined in: [clients/europeanParliamentClient.ts:234](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L234)

Returns cache statistics for monitoring and debugging.

All sub-clients share the same LRU cache and hit/miss counters
(via [EPSharedResources](../../ep/baseClient/interfaces/EPSharedResources.md)), so delegating to any single
sub-client returns aggregate statistics across the entire facade.

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

***

### getCommitteeDocumentById()

> **getCommitteeDocumentById**(`docId`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

Defined in: [clients/europeanParliamentClient.ts:701](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L701)

Returns a single committee document by ID.
**EP API Endpoint:** `GET /committee-documents/{doc-id}`

#### Parameters

##### docId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

***

### getCommitteeDocuments()

> **getCommitteeDocuments**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:626](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L626)

Returns committee documents.
**EP API Endpoint:** `GET /committee-documents`

**Note:** The EP API `/committee-documents` endpoint does not support `year`.
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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getCommitteeDocumentsFeed()

> **getCommitteeDocumentsFeed**(`options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:736](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L736)

Retrieves recently updated committee documents via the feed endpoint.
**EP API Endpoint:** `GET /committee-documents/feed`
Fixed-window feed — no parameters per OpenAPI spec.

#### Parameters

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getCommitteeInfo()

> **getCommitteeInfo**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Committee`](../../../types/ep/committee/interfaces/Committee.md)\>

Defined in: [clients/europeanParliamentClient.ts:555](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L555)

Retrieves committee (corporate body) information by ID or abbreviation.

#### Parameters

##### params

id or abbreviation

###### abbreviation?

`string`

###### abortSignal?

`AbortSignal`

###### id?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Committee`](../../../types/ep/committee/interfaces/Committee.md)\>

Committee information

#### Security

Audit logged per GDPR Article 30

#### Performance

Cached: <100ms P50, <200ms P95. Uncached: <2s P99

#### See

https://data.europarl.europa.eu/api/v2/corporate-bodies

***

### getControlledVocabularies()

> **getControlledVocabularies**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:902](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L902)

Returns EP controlled vocabularies.
**EP API Endpoint:** `GET /controlled-vocabularies`

#### Parameters

##### params?

###### abortSignal?

`AbortSignal`

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getControlledVocabulariesFeed()

> **getControlledVocabulariesFeed**(`options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:926](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L926)

Retrieves recently updated controlled vocabularies via the feed endpoint.
**EP API Endpoint:** `GET /controlled-vocabularies/feed`
Fixed-window feed — no parameters per OpenAPI spec.

#### Parameters

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getControlledVocabularyById()

> **getControlledVocabularyById**(`vocId`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>

Defined in: [clients/europeanParliamentClient.ts:914](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L914)

Returns a single EP Controlled Vocabulary by ID.
**EP API Endpoint:** `GET /controlled-vocabularies/{voc-id}`

#### Parameters

##### vocId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>

***

### getCorporateBodiesFeed()

> **getCorporateBodiesFeed**(`options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:580](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L580)

Retrieves recently updated corporate bodies via the feed endpoint.
**EP API Endpoint:** `GET /corporate-bodies/feed`
Fixed-window feed — no parameters per OpenAPI spec.

#### Parameters

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getCurrentCorporateBodies()

> **getCurrentCorporateBodies**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Committee`](../../../types/ep/committee/interfaces/Committee.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:567](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L567)

Returns the list of all current EP Corporate Bodies for today's date.
**EP API Endpoint:** `GET /corporate-bodies/show-current`

#### Parameters

##### params?

###### abortSignal?

`AbortSignal`

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Committee`](../../../types/ep/committee/interfaces/Committee.md)\>\>

***

### getCurrentMEPs()

> **getCurrentMEPs**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:284](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L284)

Returns all currently active MEPs for today's date.

Unlike `getMEPs()`, this uses `GET /meps/show-current` which returns
`api:country-of-representation` and `api:political-group` in responses.
Optional `country` and `group` filters are applied client-side after fetch.

**EP API Endpoint:** `GET /meps/show-current`

#### Parameters

##### params?

###### abortSignal?

`AbortSignal`

###### country?

`string`

###### group?

`string`

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>\>

***

### getDocumentById()

> **getDocumentById**(`docId`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

Defined in: [clients/europeanParliamentClient.ts:677](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L677)

Returns a single document by ID.
**EP API Endpoint:** `GET /documents/{doc-id}`

#### Parameters

##### docId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

***

### getDocumentsFeed()

> **getDocumentsFeed**(`options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:718](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L718)

Retrieves recently updated documents via the feed endpoint.
**EP API Endpoint:** `GET /documents/feed`
Fixed-window feed — no parameters per OpenAPI spec.

#### Parameters

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getEventById()

> **getEventById**(`eventId`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`EPEvent`](../../../types/ep/activities/interfaces/EPEvent.md)\>

Defined in: [clients/europeanParliamentClient.ts:480](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L480)

Returns a single EP event by ID.
**EP API Endpoint:** `GET /events/{event-id}`

#### Parameters

##### eventId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`EPEvent`](../../../types/ep/activities/interfaces/EPEvent.md)\>

***

### getEvents()

> **getEvents**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`EPEvent`](../../../types/ep/activities/interfaces/EPEvent.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:468](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L468)

Returns EP events (hearings, conferences, etc.).
**EP API Endpoint:** `GET /events`

**Note:** The EP API `/events` endpoint has no date filtering.
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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`EPEvent`](../../../types/ep/activities/interfaces/EPEvent.md)\>\>

***

### getEventsFeed()

> **getEventsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:488](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L488)

Retrieves recently updated events via the feed endpoint.
**EP API Endpoint:** `GET /events/feed`

#### Parameters

##### params?

###### abortSignal?

`AbortSignal`

###### activityType?

`string`

###### startDate?

`string`

###### timeframe?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getExternalDocumentById()

> **getExternalDocumentById**(`docId`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

Defined in: [clients/europeanParliamentClient.ts:709](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L709)

Returns a single external document by ID.
**EP API Endpoint:** `GET /external-documents/{doc-id}`

#### Parameters

##### docId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

***

### getExternalDocuments()

> **getExternalDocuments**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:665](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L665)

Returns all External Documents.
**EP API Endpoint:** `GET /external-documents`

**Note:** The EP API `/external-documents` endpoint does not support `year`.
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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getExternalDocumentsFeed()

> **getExternalDocumentsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:753](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L753)

Retrieves recently updated external documents via the feed endpoint.
**EP API Endpoint:** `GET /external-documents/feed`

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getHomonymMEPs()

> **getHomonymMEPs**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:322](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L322)

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>\>

***

### getIncomingMEPs()

> **getIncomingMEPs**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:298](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L298)

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>\>

***

### getMeetingActivities()

> **getMeetingActivities**(`sittingId`, `params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MeetingActivity`](../../../types/ep/activities/interfaces/MeetingActivity.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:402](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L402)

Returns activities linked to a specific meeting (plenary sitting).
**EP API Endpoint:** `GET /meetings/{sitting-id}/activities`

#### Parameters

##### sittingId

`string`

##### params?

###### abortSignal?

`AbortSignal`

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MeetingActivity`](../../../types/ep/activities/interfaces/MeetingActivity.md)\>\>

***

### getMeetingById()

> **getMeetingById**(`eventId`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PlenarySession`](../../../types/ep/plenary/interfaces/PlenarySession.md)\>

Defined in: [clients/europeanParliamentClient.ts:457](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L457)

Returns a single EP meeting by ID.
**EP API Endpoint:** `GET /meetings/{event-id}`

#### Parameters

##### eventId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PlenarySession`](../../../types/ep/plenary/interfaces/PlenarySession.md)\>

***

### getMeetingDecisions()

> **getMeetingDecisions**(`sittingId`, `params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:413](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L413)

Returns decisions made in a specific meeting (plenary sitting).
**EP API Endpoint:** `GET /meetings/{sitting-id}/decisions`

#### Parameters

##### sittingId

`string`

##### params?

###### abortSignal?

`AbortSignal`

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getMeetingForeseenActivities()

> **getMeetingForeseenActivities**(`sittingId`, `params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MeetingActivity`](../../../types/ep/activities/interfaces/MeetingActivity.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:424](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L424)

Returns foreseen activities linked to a specific meeting.
**EP API Endpoint:** `GET /meetings/{sitting-id}/foreseen-activities`

#### Parameters

##### sittingId

`string`

##### params?

###### abortSignal?

`AbortSignal`

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MeetingActivity`](../../../types/ep/activities/interfaces/MeetingActivity.md)\>\>

***

### getMeetingPlenarySessionDocumentItems()

> **getMeetingPlenarySessionDocumentItems**(`sittingId`, `params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:446](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L446)

Returns plenary session document items for a specific meeting.
**EP API Endpoint:** `GET /meetings/{sitting-id}/plenary-session-document-items`

#### Parameters

##### sittingId

`string`

##### params?

###### abortSignal?

`AbortSignal`

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getMeetingPlenarySessionDocuments()

> **getMeetingPlenarySessionDocuments**(`sittingId`, `params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:435](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L435)

Returns plenary session documents for a specific meeting.
**EP API Endpoint:** `GET /meetings/{sitting-id}/plenary-session-documents`

#### Parameters

##### sittingId

`string`

##### params?

###### abortSignal?

`AbortSignal`

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getMEPDeclarationById()

> **getMEPDeclarationById**(`docId`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MEPDeclaration`](../../../types/ep/activities/interfaces/MEPDeclaration.md)\>

Defined in: [clients/europeanParliamentClient.ts:349](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L349)

Returns a single MEP declaration by document ID.
**EP API Endpoint:** `GET /meps-declarations/{doc-id}`

#### Parameters

##### docId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MEPDeclaration`](../../../types/ep/activities/interfaces/MEPDeclaration.md)\>

#### Gdpr

Declarations contain personal financial data – access is audit-logged

***

### getMEPDeclarations()

> **getMEPDeclarations**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEPDeclaration`](../../../types/ep/activities/interfaces/MEPDeclaration.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:335](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L335)

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEPDeclaration`](../../../types/ep/activities/interfaces/MEPDeclaration.md)\>\>

#### Gdpr

Declarations contain personal financial data – access is audit-logged

***

### getMEPDeclarationsFeed()

> **getMEPDeclarationsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:369](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L369)

Retrieves recently updated MEP declarations via the feed endpoint.
**EP API Endpoint:** `GET /meps-declarations/feed`

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getMEPDetails()

> **getMEPDetails**(`id`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MEPDetails`](../../../types/ep/mep/interfaces/MEPDetails.md)\>

Defined in: [clients/europeanParliamentClient.ts:271](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L271)

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MEPDetails`](../../../types/ep/mep/interfaces/MEPDetails.md)\>

Detailed MEP information

#### Security

Personal data access logged per GDPR Article 30

#### Performance

Cached: <100ms P50, <200ms P95. Uncached: <2s P99

#### See

https://data.europarl.europa.eu/api/v2/meps/{id}

***

### getMEPs()

> **getMEPs**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:247](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L247)

Retrieves Members of the European Parliament with filtering and pagination.

#### Parameters

##### params

country, group, committee, active, limit, offset

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>\>

Paginated MEP list

#### Security

Personal data access logged per GDPR Article 30

#### Performance

Cached: <100ms P50, <200ms P95. Uncached: <2s P99

#### See

https://data.europarl.europa.eu/api/v2/meps

***

### getMEPsFeed()

> **getMEPsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:357](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L357)

Retrieves recently updated MEPs via the feed endpoint.
**EP API Endpoint:** `GET /meps/feed`

#### Parameters

##### params?

###### abortSignal?

`AbortSignal`

###### startDate?

`string`

###### timeframe?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getOutgoingMEPs()

> **getOutgoingMEPs**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:310](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L310)

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>\>

***

### getParliamentaryQuestionById()

> **getParliamentaryQuestionById**(`docId`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ParliamentaryQuestion`](../../../types/ep/question/interfaces/ParliamentaryQuestion.md)\>

Defined in: [clients/europeanParliamentClient.ts:882](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L882)

Returns a single parliamentary question by document ID.
**EP API Endpoint:** `GET /parliamentary-questions/{doc-id}`

#### Parameters

##### docId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ParliamentaryQuestion`](../../../types/ep/question/interfaces/ParliamentaryQuestion.md)\>

***

### getParliamentaryQuestions()

> **getParliamentaryQuestions**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`ParliamentaryQuestion`](../../../types/ep/question/interfaces/ParliamentaryQuestion.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:864](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L864)

Retrieves parliamentary questions with filtering by type, author, and status.

#### Parameters

##### params

type, author, topic, status, dateFrom, dateTo, limit, offset

###### abortSignal?

`AbortSignal`

###### author?

`string`

###### dateFrom?

`string`

###### dateTo?

`string`

###### limit?

`number`

###### offset?

`number`

###### status?

`"PENDING"` \| `"ANSWERED"`

###### topic?

`string`

###### type?

`"WRITTEN"` \| `"ORAL"`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`ParliamentaryQuestion`](../../../types/ep/question/interfaces/ParliamentaryQuestion.md)\>\>

Paginated parliamentary questions list

#### Security

Audit logged per GDPR Article 30

#### Performance

Cached: <100ms P50, <200ms P95. Uncached: <2s P99

#### See

https://data.europarl.europa.eu/api/v2/parliamentary-questions

***

### getParliamentaryQuestionsFeed()

> **getParliamentaryQuestionsFeed**(`options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:894](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L894)

Retrieves recently updated parliamentary questions via the feed endpoint.
**EP API Endpoint:** `GET /parliamentary-questions/feed`
Fixed-window feed — no parameters per OpenAPI spec.

#### Parameters

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getPlenaryDocumentById()

> **getPlenaryDocumentById**(`docId`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

Defined in: [clients/europeanParliamentClient.ts:685](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L685)

Returns a single plenary document by ID.
**EP API Endpoint:** `GET /plenary-documents/{doc-id}`

#### Parameters

##### docId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

***

### getPlenaryDocuments()

> **getPlenaryDocuments**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:610](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L610)

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getPlenaryDocumentsFeed()

> **getPlenaryDocumentsFeed**(`options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:727](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L727)

Retrieves recently updated plenary documents via the feed endpoint.
**EP API Endpoint:** `GET /plenary-documents/feed`
Fixed-window feed — no parameters per OpenAPI spec.

#### Parameters

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getPlenarySessionDocumentById()

> **getPlenarySessionDocumentById**(`docId`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

Defined in: [clients/europeanParliamentClient.ts:693](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L693)

Returns a single plenary session document by ID.
**EP API Endpoint:** `GET /plenary-session-documents/{doc-id}`

#### Parameters

##### docId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

***

### getPlenarySessionDocumentItems()

> **getPlenarySessionDocumentItems**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:650](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L650)

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getPlenarySessionDocuments()

> **getPlenarySessionDocuments**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:638](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L638)

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getPlenarySessionDocumentsFeed()

> **getPlenarySessionDocumentsFeed**(`options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:745](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L745)

Retrieves recently updated plenary session documents via the feed endpoint.
**EP API Endpoint:** `GET /plenary-session-documents/feed`
Fixed-window feed — no parameters per OpenAPI spec.

#### Parameters

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getPlenarySessions()

> **getPlenarySessions**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`PlenarySession`](../../../types/ep/plenary/interfaces/PlenarySession.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:386](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L386)

Retrieves plenary sessions with date and location filtering.

#### Parameters

##### params

year, dateFrom, dateTo, location, limit, offset

###### abortSignal?

`AbortSignal`

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`PlenarySession`](../../../types/ep/plenary/interfaces/PlenarySession.md)\>\>

Paginated plenary session list

#### Performance

Cached: <100ms P50, <200ms P95. Uncached: <2s P99

#### See

https://data.europarl.europa.eu/api/v2/meetings

***

### getProcedureById()

> **getProcedureById**(`processId`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Procedure`](../../../types/ep/activities/interfaces/Procedure.md)\>

Defined in: [clients/europeanParliamentClient.ts:782](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L782)

Returns a single procedure by ID.
**EP API Endpoint:** `GET /procedures/{process-id}`

#### Parameters

##### processId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Procedure`](../../../types/ep/activities/interfaces/Procedure.md)\>

#### Throws

When the procedure is not found (404)

***

### getProcedureEventById()

> **getProcedureEventById**(`processId`, `eventId`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`EPEvent`](../../../types/ep/activities/interfaces/EPEvent.md)\>

Defined in: [clients/europeanParliamentClient.ts:851](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L851)

Returns a single event within a procedure by event ID.
**EP API Endpoint:** `GET /procedures/{process-id}/events/{event-id}`

#### Parameters

##### processId

`string`

Procedure process ID

##### eventId

`string`

Event identifier within the procedure

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`EPEvent`](../../../types/ep/activities/interfaces/EPEvent.md)\>

***

### getProcedureEvents()

> **getProcedureEvents**(`processId`, `params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`EPEvent`](../../../types/ep/activities/interfaces/EPEvent.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:790](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L790)

Returns events linked to a procedure.
**EP API Endpoint:** `GET /procedures/{process-id}/events`

#### Parameters

##### processId

`string`

##### params?

###### abortSignal?

`AbortSignal`

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`EPEvent`](../../../types/ep/activities/interfaces/EPEvent.md)\>\>

***

### getProcedures()

> **getProcedures**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Procedure`](../../../types/ep/activities/interfaces/Procedure.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:769](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L769)

Returns legislative procedures.
**EP API Endpoint:** `GET /procedures`

**Note:** The EP API `/procedures` endpoint does not support `year`.
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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Procedure`](../../../types/ep/activities/interfaces/Procedure.md)\>\>

***

### getProceduresFeed()

> **getProceduresFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:822](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L822)

Retrieves recently updated procedures via the feed endpoint.
**EP API Endpoint:** `GET /procedures/feed`

#### Parameters

##### params?

###### abortSignal?

`AbortSignal`

###### processType?

`string`

###### startDate?

`string`

###### timeframe?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getSpeechById()

> **getSpeechById**(`speechId`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Speech`](../../../types/ep/activities/interfaces/Speech.md)\>

Defined in: [clients/europeanParliamentClient.ts:542](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L542)

Returns a single speech by ID.
**EP API Endpoint:** `GET /speeches/{speech-id}`

#### Parameters

##### speechId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Speech`](../../../types/ep/activities/interfaces/Speech.md)\>

***

### getSpeeches()

> **getSpeeches**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Speech`](../../../types/ep/activities/interfaces/Speech.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:528](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L528)

Returns plenary speeches.
**EP API Endpoint:** `GET /speeches`

**Note:** The EP API `/speeches` endpoint does not support `year`.
Use `dateFrom`/`dateTo` (mapped to `sitting-date`/`sitting-date-end`).

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Speech`](../../../types/ep/activities/interfaces/Speech.md)\>\>

***

### getVotingRecords()

> **getVotingRecords**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`VotingRecord`](../../../types/ep/plenary/interfaces/VotingRecord.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:509](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L509)

Retrieves voting records with filtering by session, topic, and date.

The EP API returns only aggregate vote counts; per-MEP vote positions are
not available from this endpoint.

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`VotingRecord`](../../../types/ep/plenary/interfaces/VotingRecord.md)\>\>

Paginated voting records list

#### Security

Audit logged per GDPR Article 30

#### Performance

Cached: <100ms P50, <200ms P95. Uncached: <2s P99

#### See

https://data.europarl.europa.eu/api/v2/meetings/{sitting-id}/vote-results

***

### searchDocuments()

> **searchDocuments**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:593](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L593)

Searches legislative documents by keyword, type, date, and committee.

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Paginated legislative documents list

#### Security

Audit logged per GDPR Article 30

#### Performance

Cached: <100ms P50, <200ms P95. Uncached: <2s P99

#### See

https://data.europarl.europa.eu/api/v2/documents

***

### buildShared()

> `private` `static` **buildShared**(`config`): [`EPSharedResources`](../../ep/baseClient/interfaces/EPSharedResources.md)

Defined in: [clients/europeanParliamentClient.ts:182](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L182)

Builds the shared resources object that is passed to all sub-clients.
Extracted to keep the constructor complexity within ESLint limits.

#### Parameters

##### config

[`EPClientConfig`](../../ep/baseClient/interfaces/EPClientConfig.md)

Client configuration options

#### Returns

[`EPSharedResources`](../../ep/baseClient/interfaces/EPSharedResources.md)

Shared resources for all EP sub-clients

#### Private
