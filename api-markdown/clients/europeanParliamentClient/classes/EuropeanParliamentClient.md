[**European Parliament MCP Server API v1.1.21**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [clients/europeanParliamentClient](../README.md) / EuropeanParliamentClient

# Class: EuropeanParliamentClient

Defined in: [clients/europeanParliamentClient.ts:147](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L147)

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

Defined in: [clients/europeanParliamentClient.ts:166](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L166)

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

Defined in: [clients/europeanParliamentClient.ts:152](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L152)

***

### documentClient

> `private` `readonly` **documentClient**: [`DocumentClient`](../../ep/documentClient/classes/DocumentClient.md)

Defined in: [clients/europeanParliamentClient.ts:153](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L153)

***

### legislativeClient

> `private` `readonly` **legislativeClient**: [`LegislativeClient`](../../ep/legislativeClient/classes/LegislativeClient.md)

Defined in: [clients/europeanParliamentClient.ts:154](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L154)

***

### mepClient

> `private` `readonly` **mepClient**: [`MEPClient`](../../ep/mepClient/classes/MEPClient.md)

Defined in: [clients/europeanParliamentClient.ts:149](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L149)

***

### plenaryClient

> `private` `readonly` **plenaryClient**: [`PlenaryClient`](../../ep/plenaryClient/classes/PlenaryClient.md)

Defined in: [clients/europeanParliamentClient.ts:150](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L150)

***

### questionClient

> `private` `readonly` **questionClient**: [`QuestionClient`](../../ep/questionClient/classes/QuestionClient.md)

Defined in: [clients/europeanParliamentClient.ts:155](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L155)

***

### vocabularyClient

> `private` `readonly` **vocabularyClient**: [`VocabularyClient`](../../ep/vocabularyClient/classes/VocabularyClient.md)

Defined in: [clients/europeanParliamentClient.ts:156](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L156)

***

### votingClient

> `private` `readonly` **votingClient**: [`VotingClient`](../../ep/votingClient/classes/VotingClient.md)

Defined in: [clients/europeanParliamentClient.ts:151](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L151)

## Methods

### clearCache()

> **clearCache**(): `void`

Defined in: [clients/europeanParliamentClient.ts:228](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L228)

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

> **getAdoptedTextById**(`docId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`AdoptedText`](../../../types/ep/activities/interfaces/AdoptedText.md)\>

Defined in: [clients/europeanParliamentClient.ts:810](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L810)

Returns a single adopted text by document ID.
**EP API Endpoint:** `GET /adopted-texts/{doc-id}`

#### Parameters

##### docId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`AdoptedText`](../../../types/ep/activities/interfaces/AdoptedText.md)\>

***

### getAdoptedTexts()

> **getAdoptedTexts**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`AdoptedText`](../../../types/ep/activities/interfaces/AdoptedText.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:798](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L798)

Returns adopted texts.
**EP API Endpoint:** `GET /adopted-texts`

#### Parameters

##### params?

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

Defined in: [clients/europeanParliamentClient.ts:830](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L830)

Retrieves recently updated adopted texts via the feed endpoint.
**EP API Endpoint:** `GET /adopted-texts/feed`

#### Parameters

##### params?

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

Defined in: [clients/europeanParliamentClient.ts:239](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L239)

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

***

### getCommitteeDocumentById()

> **getCommitteeDocumentById**(`docId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

Defined in: [clients/europeanParliamentClient.ts:692](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L692)

Returns a single committee document by ID.
**EP API Endpoint:** `GET /committee-documents/{doc-id}`

#### Parameters

##### docId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

***

### getCommitteeDocuments()

> **getCommitteeDocuments**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:622](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L622)

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getCommitteeDocumentsFeed()

> **getCommitteeDocumentsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:730](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L730)

Retrieves recently updated committee documents via the feed endpoint.
**EP API Endpoint:** `GET /committee-documents/feed`

#### Parameters

##### params?

###### startDate?

`string`

###### timeframe?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getCommitteeInfo()

> **getCommitteeInfo**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Committee`](../../../types/ep/committee/interfaces/Committee.md)\>

Defined in: [clients/europeanParliamentClient.ts:554](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L554)

Retrieves committee (corporate body) information by ID or abbreviation.

#### Parameters

##### params

id or abbreviation

###### abbreviation?

`string`

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

Defined in: [clients/europeanParliamentClient.ts:900](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L900)

Returns EP controlled vocabularies.
**EP API Endpoint:** `GET /controlled-vocabularies`

#### Parameters

##### params?

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getControlledVocabulariesFeed()

> **getControlledVocabulariesFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:921](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L921)

Retrieves recently updated controlled vocabularies via the feed endpoint.
**EP API Endpoint:** `GET /controlled-vocabularies/feed`

#### Parameters

##### params?

###### startDate?

`string`

###### timeframe?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getControlledVocabularyById()

> **getControlledVocabularyById**(`vocId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>

Defined in: [clients/europeanParliamentClient.ts:911](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L911)

Returns a single EP Controlled Vocabulary by ID.
**EP API Endpoint:** `GET /controlled-vocabularies/{voc-id}`

#### Parameters

##### vocId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>

***

### getCorporateBodiesFeed()

> **getCorporateBodiesFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:576](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L576)

Retrieves recently updated corporate bodies via the feed endpoint.
**EP API Endpoint:** `GET /corporate-bodies/feed`

#### Parameters

##### params?

###### startDate?

`string`

###### timeframe?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getCurrentCorporateBodies()

> **getCurrentCorporateBodies**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Committee`](../../../types/ep/committee/interfaces/Committee.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:565](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L565)

Returns the list of all current EP Corporate Bodies for today's date.
**EP API Endpoint:** `GET /corporate-bodies/show-current`

#### Parameters

##### params?

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Committee`](../../../types/ep/committee/interfaces/Committee.md)\>\>

***

### getCurrentMEPs()

> **getCurrentMEPs**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:290](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L290)

Returns all currently active MEPs for today's date.

Unlike `getMEPs()`, this uses `GET /meps/show-current` which returns
`api:country-of-representation` and `api:political-group` in responses.
Optional `country` and `group` filters are applied client-side after fetch.

**EP API Endpoint:** `GET /meps/show-current`

#### Parameters

##### params?

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

> **getDocumentById**(`docId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

Defined in: [clients/europeanParliamentClient.ts:668](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L668)

Returns a single document by ID.
**EP API Endpoint:** `GET /documents/{doc-id}`

#### Parameters

##### docId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

***

### getDocumentsFeed()

> **getDocumentsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:708](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L708)

Retrieves recently updated documents via the feed endpoint.
**EP API Endpoint:** `GET /documents/feed`

#### Parameters

##### params?

###### startDate?

`string`

###### timeframe?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getEventById()

> **getEventById**(`eventId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`EPEvent`](../../../types/ep/activities/interfaces/EPEvent.md)\>

Defined in: [clients/europeanParliamentClient.ts:479](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L479)

Returns a single EP event by ID.
**EP API Endpoint:** `GET /events/{event-id}`

#### Parameters

##### eventId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`EPEvent`](../../../types/ep/activities/interfaces/EPEvent.md)\>

***

### getEvents()

> **getEvents**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`EPEvent`](../../../types/ep/activities/interfaces/EPEvent.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:465](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L465)

Returns EP events (hearings, conferences, etc.).
**EP API Endpoint:** `GET /events`

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

###### year?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`EPEvent`](../../../types/ep/activities/interfaces/EPEvent.md)\>\>

***

### getEventsFeed()

> **getEventsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:487](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L487)

Retrieves recently updated events via the feed endpoint.
**EP API Endpoint:** `GET /events/feed`

#### Parameters

##### params?

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

> **getExternalDocumentById**(`docId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

Defined in: [clients/europeanParliamentClient.ts:700](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L700)

Returns a single external document by ID.
**EP API Endpoint:** `GET /external-documents/{doc-id}`

#### Parameters

##### docId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

***

### getExternalDocuments()

> **getExternalDocuments**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:656](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L656)

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getExternalDocumentsFeed()

> **getExternalDocumentsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:752](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L752)

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getHomonymMEPs()

> **getHomonymMEPs**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:325](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L325)

Returns homonym MEPs for the current parliamentary term.
**EP API Endpoint:** `GET /meps/show-homonyms`

#### Parameters

##### params?

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>\>

***

### getIncomingMEPs()

> **getIncomingMEPs**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:303](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L303)

Returns all incoming MEPs for the current parliamentary term.
**EP API Endpoint:** `GET /meps/show-incoming`

#### Parameters

##### params?

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

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MeetingActivity`](../../../types/ep/activities/interfaces/MeetingActivity.md)\>\>

***

### getMeetingById()

> **getMeetingById**(`eventId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PlenarySession`](../../../types/ep/plenary/interfaces/PlenarySession.md)\>

Defined in: [clients/europeanParliamentClient.ts:457](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L457)

Returns a single EP meeting by ID.
**EP API Endpoint:** `GET /meetings/{event-id}`

#### Parameters

##### eventId

`string`

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

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getMEPDeclarationById()

> **getMEPDeclarationById**(`docId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MEPDeclaration`](../../../types/ep/activities/interfaces/MEPDeclaration.md)\>

Defined in: [clients/europeanParliamentClient.ts:350](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L350)

Returns a single MEP declaration by document ID.
**EP API Endpoint:** `GET /meps-declarations/{doc-id}`

#### Parameters

##### docId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MEPDeclaration`](../../../types/ep/activities/interfaces/MEPDeclaration.md)\>

#### Gdpr

Declarations contain personal financial data – access is audit-logged

***

### getMEPDeclarations()

> **getMEPDeclarations**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEPDeclaration`](../../../types/ep/activities/interfaces/MEPDeclaration.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:337](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L337)

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

> **getMEPDetails**(`id`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MEPDetails`](../../../types/ep/mep/interfaces/MEPDetails.md)\>

Defined in: [clients/europeanParliamentClient.ts:277](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L277)

Retrieves detailed information about a specific MEP.

Supports numeric ID ("124936"), person URI ("person/124936"),
or MEP-prefixed ID ("MEP-124936").

#### Parameters

##### id

`string`

MEP identifier in any supported format

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

Defined in: [clients/europeanParliamentClient.ts:254](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L254)

Retrieves Members of the European Parliament with filtering and pagination.

#### Parameters

##### params

country, group, committee, active, limit, offset

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

Defined in: [clients/europeanParliamentClient.ts:358](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L358)

Retrieves recently updated MEPs via the feed endpoint.
**EP API Endpoint:** `GET /meps/feed`

#### Parameters

##### params?

###### startDate?

`string`

###### timeframe?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getOutgoingMEPs()

> **getOutgoingMEPs**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:314](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L314)

Returns all outgoing MEPs for the current parliamentary term.
**EP API Endpoint:** `GET /meps/show-outgoing`

#### Parameters

##### params?

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>\>

***

### getParliamentaryQuestionById()

> **getParliamentaryQuestionById**(`docId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ParliamentaryQuestion`](../../../types/ep/question/interfaces/ParliamentaryQuestion.md)\>

Defined in: [clients/europeanParliamentClient.ts:877](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L877)

Returns a single parliamentary question by document ID.
**EP API Endpoint:** `GET /parliamentary-questions/{doc-id}`

#### Parameters

##### docId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ParliamentaryQuestion`](../../../types/ep/question/interfaces/ParliamentaryQuestion.md)\>

***

### getParliamentaryQuestions()

> **getParliamentaryQuestions**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`ParliamentaryQuestion`](../../../types/ep/question/interfaces/ParliamentaryQuestion.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:860](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L860)

Retrieves parliamentary questions with filtering by type, author, and status.

#### Parameters

##### params

type, author, topic, status, dateFrom, dateTo, limit, offset

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

> **getParliamentaryQuestionsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:887](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L887)

Retrieves recently updated parliamentary questions via the feed endpoint.
**EP API Endpoint:** `GET /parliamentary-questions/feed`

#### Parameters

##### params?

###### startDate?

`string`

###### timeframe?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getPlenaryDocumentById()

> **getPlenaryDocumentById**(`docId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

Defined in: [clients/europeanParliamentClient.ts:676](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L676)

Returns a single plenary document by ID.
**EP API Endpoint:** `GET /plenary-documents/{doc-id}`

#### Parameters

##### docId

`string`

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

> **getPlenaryDocumentsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:719](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L719)

Retrieves recently updated plenary documents via the feed endpoint.
**EP API Endpoint:** `GET /plenary-documents/feed`

#### Parameters

##### params?

###### startDate?

`string`

###### timeframe?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getPlenarySessionDocumentById()

> **getPlenarySessionDocumentById**(`docId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

Defined in: [clients/europeanParliamentClient.ts:684](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L684)

Returns a single plenary session document by ID.
**EP API Endpoint:** `GET /plenary-session-documents/{doc-id}`

#### Parameters

##### docId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

***

### getPlenarySessionDocumentItems()

> **getPlenarySessionDocumentItems**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:645](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L645)

Returns all Plenary Session Document Items.
**EP API Endpoint:** `GET /plenary-session-documents-items`

#### Parameters

##### params?

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getPlenarySessionDocuments()

> **getPlenarySessionDocuments**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:634](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L634)

Returns plenary session documents.
**EP API Endpoint:** `GET /plenary-session-documents`

#### Parameters

##### params?

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getPlenarySessionDocumentsFeed()

> **getPlenarySessionDocumentsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:741](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L741)

Retrieves recently updated plenary session documents via the feed endpoint.
**EP API Endpoint:** `GET /plenary-session-documents/feed`

#### Parameters

##### params?

###### startDate?

`string`

###### timeframe?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getPlenarySessions()

> **getPlenarySessions**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`PlenarySession`](../../../types/ep/plenary/interfaces/PlenarySession.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:387](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L387)

Retrieves plenary sessions with date and location filtering.

#### Parameters

##### params

year, dateFrom, dateTo, location, limit, offset

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

> **getProcedureById**(`processId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Procedure`](../../../types/ep/activities/interfaces/Procedure.md)\>

Defined in: [clients/europeanParliamentClient.ts:779](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L779)

Returns a single procedure by ID.
**EP API Endpoint:** `GET /procedures/{process-id}`

#### Parameters

##### processId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Procedure`](../../../types/ep/activities/interfaces/Procedure.md)\>

#### Throws

When the procedure is not found (404)

***

### getProcedureEventById()

> **getProcedureEventById**(`processId`, `eventId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>

Defined in: [clients/europeanParliamentClient.ts:845](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L845)

Returns a single event within a procedure by event ID.
**EP API Endpoint:** `GET /procedures/{process-id}/events/{event-id}`

#### Parameters

##### processId

`string`

Procedure process ID

##### eventId

`string`

Event identifier within the procedure

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>

***

### getProcedureEvents()

> **getProcedureEvents**(`processId`, `params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`EPEvent`](../../../types/ep/activities/interfaces/EPEvent.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:787](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L787)

Returns events linked to a procedure.
**EP API Endpoint:** `GET /procedures/{process-id}/events`

#### Parameters

##### processId

`string`

##### params?

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`EPEvent`](../../../types/ep/activities/interfaces/EPEvent.md)\>\>

***

### getProcedures()

> **getProcedures**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Procedure`](../../../types/ep/activities/interfaces/Procedure.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:766](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L766)

Returns legislative procedures.
**EP API Endpoint:** `GET /procedures`

#### Parameters

##### params?

###### limit?

`number`

###### offset?

`number`

###### year?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Procedure`](../../../types/ep/activities/interfaces/Procedure.md)\>\>

***

### getProceduresFeed()

> **getProceduresFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:818](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L818)

Retrieves recently updated procedures via the feed endpoint.
**EP API Endpoint:** `GET /procedures/feed`

#### Parameters

##### params?

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

> **getSpeechById**(`speechId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Speech`](../../../types/ep/activities/interfaces/Speech.md)\>

Defined in: [clients/europeanParliamentClient.ts:539](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L539)

Returns a single speech by ID.
**EP API Endpoint:** `GET /speeches/{speech-id}`

#### Parameters

##### speechId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Speech`](../../../types/ep/activities/interfaces/Speech.md)\>

***

### getSpeeches()

> **getSpeeches**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Speech`](../../../types/ep/activities/interfaces/Speech.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:525](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L525)

Returns plenary speeches.
**EP API Endpoint:** `GET /speeches`

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

###### year?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Speech`](../../../types/ep/activities/interfaces/Speech.md)\>\>

***

### getVotingRecords()

> **getVotingRecords**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`VotingRecord`](../../../types/ep/plenary/interfaces/VotingRecord.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:508](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L508)

Retrieves voting records with filtering by session, topic, and date.

#### Parameters

##### params

sessionId, topic, dateFrom, dateTo, limit, offset

###### dateFrom?

`string`

###### dateTo?

`string`

###### limit?

`number`

###### mepId?

`string`

**Deprecated**

Ignored; this endpoint only returns aggregate vote counts, not per-MEP positions.

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

Defined in: [clients/europeanParliamentClient.ts:594](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L594)

Searches legislative documents by keyword, type, date, and committee.

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

Defined in: [clients/europeanParliamentClient.ts:186](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L186)

Builds the shared resources object that is passed to all sub-clients.
Extracted to keep the constructor complexity within ESLint limits.

#### Parameters

##### config

[`EPClientConfig`](../../ep/baseClient/interfaces/EPClientConfig.md)

Client configuration options

#### Returns

[`EPSharedResources`](../../ep/baseClient/interfaces/EPSharedResources.md)

Shared resources for all EP sub-clients
