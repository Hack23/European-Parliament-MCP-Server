[**European Parliament MCP Server API v1.1.0**](../../../README.md)

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

`EPClientConfig` = `{}`

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

Defined in: [clients/europeanParliamentClient.ts:803](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L803)

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

Defined in: [clients/europeanParliamentClient.ts:791](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L791)

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

> **getAdoptedTextsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:823](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L823)

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

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

Defined in: [clients/europeanParliamentClient.ts:685](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L685)

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

Defined in: [clients/europeanParliamentClient.ts:615](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L615)

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

> **getCommitteeDocumentsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:723](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L723)

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

### getCommitteeInfo()

> **getCommitteeInfo**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Committee`](../../../types/ep/committee/interfaces/Committee.md)\>

Defined in: [clients/europeanParliamentClient.ts:547](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L547)

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

Defined in: [clients/europeanParliamentClient.ts:893](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L893)

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

> **getControlledVocabulariesFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:914](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L914)

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

Defined in: [clients/europeanParliamentClient.ts:904](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L904)

Returns a single EP Controlled Vocabulary by ID.
**EP API Endpoint:** `GET /controlled-vocabularies/{voc-id}`

#### Parameters

##### vocId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>

***

### getCorporateBodiesFeed()

> **getCorporateBodiesFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:569](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L569)

Retrieves recently updated corporate bodies via the feed endpoint.
**EP API Endpoint:** `GET /corporate-bodies/feed`

#### Parameters

##### params?

###### startDate?

`string`

###### timeframe?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getCurrentCorporateBodies()

> **getCurrentCorporateBodies**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Committee`](../../../types/ep/committee/interfaces/Committee.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:558](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L558)

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

Defined in: [clients/europeanParliamentClient.ts:285](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L285)

Returns all currently active MEPs for today's date.
**EP API Endpoint:** `GET /meps/show-current`

#### Parameters

##### params?

###### limit?

`number`

###### offset?

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>\>

***

### getDocumentById()

> **getDocumentById**(`docId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

Defined in: [clients/europeanParliamentClient.ts:661](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L661)

Returns a single document by ID.
**EP API Endpoint:** `GET /documents/{doc-id}`

#### Parameters

##### docId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

***

### getDocumentsFeed()

> **getDocumentsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:701](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L701)

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

### getEventById()

> **getEventById**(`eventId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`EPEvent`](../../../types/ep/activities/interfaces/EPEvent.md)\>

Defined in: [clients/europeanParliamentClient.ts:472](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L472)

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

Defined in: [clients/europeanParliamentClient.ts:458](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L458)

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

> **getEventsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:480](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L480)

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getExternalDocumentById()

> **getExternalDocumentById**(`docId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

Defined in: [clients/europeanParliamentClient.ts:693](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L693)

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

Defined in: [clients/europeanParliamentClient.ts:649](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L649)

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

> **getExternalDocumentsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:745](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L745)

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

### getHomonymMEPs()

> **getHomonymMEPs**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:318](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L318)

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

Defined in: [clients/europeanParliamentClient.ts:296](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L296)

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

Defined in: [clients/europeanParliamentClient.ts:395](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L395)

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

Defined in: [clients/europeanParliamentClient.ts:450](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L450)

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

Defined in: [clients/europeanParliamentClient.ts:406](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L406)

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

Defined in: [clients/europeanParliamentClient.ts:417](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L417)

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

Defined in: [clients/europeanParliamentClient.ts:439](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L439)

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

Defined in: [clients/europeanParliamentClient.ts:428](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L428)

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

Defined in: [clients/europeanParliamentClient.ts:343](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L343)

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

Defined in: [clients/europeanParliamentClient.ts:330](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L330)

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

> **getMEPDeclarationsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:362](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L362)

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

> **getMEPsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:351](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L351)

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

> **getOutgoingMEPs**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:307](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L307)

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

Defined in: [clients/europeanParliamentClient.ts:870](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L870)

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

Defined in: [clients/europeanParliamentClient.ts:853](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L853)

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

> **getParliamentaryQuestionsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:880](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L880)

Retrieves recently updated parliamentary questions via the feed endpoint.
**EP API Endpoint:** `GET /parliamentary-questions/feed`

#### Parameters

##### params?

###### startDate?

`string`

###### timeframe?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getPlenaryDocumentById()

> **getPlenaryDocumentById**(`docId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

Defined in: [clients/europeanParliamentClient.ts:669](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L669)

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

Defined in: [clients/europeanParliamentClient.ts:603](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L603)

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

> **getPlenaryDocumentsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:712](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L712)

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

> **getPlenarySessionDocumentById**(`docId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

Defined in: [clients/europeanParliamentClient.ts:677](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L677)

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

Defined in: [clients/europeanParliamentClient.ts:638](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L638)

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

Defined in: [clients/europeanParliamentClient.ts:627](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L627)

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

> **getPlenarySessionDocumentsFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:734](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L734)

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

### getPlenarySessions()

> **getPlenarySessions**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`PlenarySession`](../../../types/ep/plenary/interfaces/PlenarySession.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:380](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L380)

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

Defined in: [clients/europeanParliamentClient.ts:772](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L772)

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

Defined in: [clients/europeanParliamentClient.ts:838](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L838)

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

Defined in: [clients/europeanParliamentClient.ts:780](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L780)

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

Defined in: [clients/europeanParliamentClient.ts:759](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L759)

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

> **getProceduresFeed**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:811](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L811)

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`JSONLDResponse`\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>\>

***

### getSpeechById()

> **getSpeechById**(`speechId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Speech`](../../../types/ep/activities/interfaces/Speech.md)\>

Defined in: [clients/europeanParliamentClient.ts:532](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L532)

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

Defined in: [clients/europeanParliamentClient.ts:518](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L518)

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

Defined in: [clients/europeanParliamentClient.ts:501](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L501)

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

Defined in: [clients/europeanParliamentClient.ts:587](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L587)

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

> `private` `static` **buildShared**(`config`): `EPSharedResources`

Defined in: [clients/europeanParliamentClient.ts:186](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L186)

Builds the shared resources object that is passed to all sub-clients.
Extracted to keep the constructor complexity within ESLint limits.

#### Parameters

##### config

`EPClientConfig`

Client configuration options

#### Returns

`EPSharedResources`

Shared resources for all EP sub-clients
