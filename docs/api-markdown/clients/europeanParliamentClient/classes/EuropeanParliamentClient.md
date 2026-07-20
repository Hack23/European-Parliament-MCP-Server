[**European Parliament MCP Server API v1.4.3**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [clients/europeanParliamentClient](../README.md) / EuropeanParliamentClient

# Class: EuropeanParliamentClient

Defined in: [clients/europeanParliamentClient.ts:154](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L154)

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

Defined in: [clients/europeanParliamentClient.ts:173](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L173)

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

Defined in: [clients/europeanParliamentClient.ts:158](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L158)

***

### documentClient

> `private` `readonly` **documentClient**: [`DocumentClient`](../../ep/documentClient/classes/DocumentClient.md)

Defined in: [clients/europeanParliamentClient.ts:159](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L159)

***

### legislativeClient

> `private` `readonly` **legislativeClient**: [`LegislativeClient`](../../ep/legislativeClient/classes/LegislativeClient.md)

Defined in: [clients/europeanParliamentClient.ts:160](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L160)

***

### mepClient

> `private` `readonly` **mepClient**: [`MEPClient`](../../ep/mepClient/classes/MEPClient.md)

Defined in: [clients/europeanParliamentClient.ts:155](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L155)

***

### plenaryClient

> `private` `readonly` **plenaryClient**: [`PlenaryClient`](../../ep/plenaryClient/classes/PlenaryClient.md)

Defined in: [clients/europeanParliamentClient.ts:156](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L156)

***

### questionClient

> `private` `readonly` **questionClient**: [`QuestionClient`](../../ep/questionClient/classes/QuestionClient.md)

Defined in: [clients/europeanParliamentClient.ts:161](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L161)

***

### useWeeklyCache

> `private` `readonly` **useWeeklyCache**: `boolean`

Defined in: [clients/europeanParliamentClient.ts:163](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L163)

***

### vocabularyClient

> `private` `readonly` **vocabularyClient**: [`VocabularyClient`](../../ep/vocabularyClient/classes/VocabularyClient.md)

Defined in: [clients/europeanParliamentClient.ts:162](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L162)

***

### votingClient

> `private` `readonly` **votingClient**: [`VotingClient`](../../ep/votingClient/classes/VotingClient.md)

Defined in: [clients/europeanParliamentClient.ts:157](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L157)

## Methods

### buildCachedCurrentMEPs()

> `private` **buildCachedCurrentMEPs**(`cache`): [`MEP`](../../../types/ep/mep/interfaces/MEP.md)[]

Defined in: [clients/europeanParliamentClient.ts:265](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L265)

#### Parameters

##### cache

###### mepDetails

`Record`\<`string`, \{ `active`: `boolean`; `committees`: `string`[]; `country`: `string`; `id`: `string`; `name`: `string`; `politicalGroup`: `string`; `termStart`: `string`; `address?`: `string`; `bday?`: `string`; `biography?`: `string`; `citizenship?`: `string`; `email?`: `string`; `facebook?`: `string`; `familyName?`: `string`; `givenName?`: `string`; `hasEmail?`: `string`; `hasGender?`: `string`; `hasHonorificPrefix?`: `string`; `hasMembership?`: `object`[]; `identifier?`: `string`; `img?`: `string`; `label?`: `string`; `notation_codictPersonId?`: `string`; `phone?`: `string`; `placeOfBirth?`: `string`; `roles?`: `string`[]; `sortLabel?`: `string`; `termEnd?`: `string`; `twitter?`: `string`; `type?`: `string`; `upperFamilyName?`: `string`; `upperGivenName?`: `string`; `votingStatistics?`: \{ `abstentions`: `number`; `attendanceRate`: `number`; `totalVotes`: `number`; `votesAgainst`: `number`; `votesFor`: `number`; \}; `website?`: `string`; \}\> = `...`

###### meps

`object`[] = `...`

###### metadata

\{ `generatedAt`: `string`; `schemaVersion`: `number`; `source`: `string`; `complete?`: `boolean`; `dataset?`: `"meps"` \| `"corporate-bodies"` \| `"controlled-vocabularies"`; `detailCount?`: `number`; `recordCount?`: `number`; `scope?`: `"current"` \| `"all"`; `weekKey?`: `string`; \} = `CacheMetadataSchema`

###### metadata.generatedAt

`string` = `...`

###### metadata.schemaVersion

`number` = `...`

###### metadata.source

`string` = `...`

###### metadata.complete?

`boolean` = `...`

###### metadata.dataset?

`"meps"` \| `"corporate-bodies"` \| `"controlled-vocabularies"` = `...`

###### metadata.detailCount?

`number` = `...`

###### metadata.recordCount?

`number` = `...`

###### metadata.scope?

`"current"` \| `"all"` = `...`

###### metadata.weekKey?

`string` = `...`

#### Returns

[`MEP`](../../../types/ep/mep/interfaces/MEP.md)[]

***

### clearCache()

> **clearCache**(): `void`

Defined in: [clients/europeanParliamentClient.ts:232](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L232)

Clears all entries from the LRU cache.

#### Returns

`void`

#### Example

```typescript
client.clearCache();
const freshData = await client.getMEPs({ country: 'SE' });
```

***

### filterCachedMEPsByCommittee()

> `private` **filterCachedMEPsByCommittee**(`meps`, `requested`, `cache`): `Promise`\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)[]\>

Defined in: [clients/europeanParliamentClient.ts:303](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L303)

#### Parameters

##### meps

[`MEP`](../../../types/ep/mep/interfaces/MEP.md)[]

##### requested

`string` \| `undefined`

##### cache

###### mepDetails

`Record`\<`string`, \{ `active`: `boolean`; `committees`: `string`[]; `country`: `string`; `id`: `string`; `name`: `string`; `politicalGroup`: `string`; `termStart`: `string`; `address?`: `string`; `bday?`: `string`; `biography?`: `string`; `citizenship?`: `string`; `email?`: `string`; `facebook?`: `string`; `familyName?`: `string`; `givenName?`: `string`; `hasEmail?`: `string`; `hasGender?`: `string`; `hasHonorificPrefix?`: `string`; `hasMembership?`: `object`[]; `identifier?`: `string`; `img?`: `string`; `label?`: `string`; `notation_codictPersonId?`: `string`; `phone?`: `string`; `placeOfBirth?`: `string`; `roles?`: `string`[]; `sortLabel?`: `string`; `termEnd?`: `string`; `twitter?`: `string`; `type?`: `string`; `upperFamilyName?`: `string`; `upperGivenName?`: `string`; `votingStatistics?`: \{ `abstentions`: `number`; `attendanceRate`: `number`; `totalVotes`: `number`; `votesAgainst`: `number`; `votesFor`: `number`; \}; `website?`: `string`; \}\> = `...`

###### meps

`object`[] = `...`

###### metadata

\{ `generatedAt`: `string`; `schemaVersion`: `number`; `source`: `string`; `complete?`: `boolean`; `dataset?`: `"meps"` \| `"corporate-bodies"` \| `"controlled-vocabularies"`; `detailCount?`: `number`; `recordCount?`: `number`; `scope?`: `"current"` \| `"all"`; `weekKey?`: `string`; \} = `CacheMetadataSchema`

###### metadata.generatedAt

`string` = `...`

###### metadata.schemaVersion

`number` = `...`

###### metadata.source

`string` = `...`

###### metadata.complete?

`boolean` = `...`

###### metadata.dataset?

`"meps"` \| `"corporate-bodies"` \| `"controlled-vocabularies"` = `...`

###### metadata.detailCount?

`number` = `...`

###### metadata.recordCount?

`number` = `...`

###### metadata.scope?

`"current"` \| `"all"` = `...`

###### metadata.weekKey?

`string` = `...`

#### Returns

`Promise`\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)[]\>

***

### findCachedMEPDetails()

> `private` **findCachedMEPDetails**(`cache`, `id`): [`MEPDetails`](../../../types/ep/mep/interfaces/MEPDetails.md) \| `undefined`

Defined in: [clients/europeanParliamentClient.ts:256](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L256)

#### Parameters

##### cache

###### mepDetails

`Record`\<`string`, \{ `active`: `boolean`; `committees`: `string`[]; `country`: `string`; `id`: `string`; `name`: `string`; `politicalGroup`: `string`; `termStart`: `string`; `address?`: `string`; `bday?`: `string`; `biography?`: `string`; `citizenship?`: `string`; `email?`: `string`; `facebook?`: `string`; `familyName?`: `string`; `givenName?`: `string`; `hasEmail?`: `string`; `hasGender?`: `string`; `hasHonorificPrefix?`: `string`; `hasMembership?`: `object`[]; `identifier?`: `string`; `img?`: `string`; `label?`: `string`; `notation_codictPersonId?`: `string`; `phone?`: `string`; `placeOfBirth?`: `string`; `roles?`: `string`[]; `sortLabel?`: `string`; `termEnd?`: `string`; `twitter?`: `string`; `type?`: `string`; `upperFamilyName?`: `string`; `upperGivenName?`: `string`; `votingStatistics?`: \{ `abstentions`: `number`; `attendanceRate`: `number`; `totalVotes`: `number`; `votesAgainst`: `number`; `votesFor`: `number`; \}; `website?`: `string`; \}\> = `...`

###### meps

`object`[] = `...`

###### metadata

\{ `generatedAt`: `string`; `schemaVersion`: `number`; `source`: `string`; `complete?`: `boolean`; `dataset?`: `"meps"` \| `"corporate-bodies"` \| `"controlled-vocabularies"`; `detailCount?`: `number`; `recordCount?`: `number`; `scope?`: `"current"` \| `"all"`; `weekKey?`: `string`; \} = `CacheMetadataSchema`

###### metadata.generatedAt

`string` = `...`

###### metadata.schemaVersion

`number` = `...`

###### metadata.source

`string` = `...`

###### metadata.complete?

`boolean` = `...`

###### metadata.dataset?

`"meps"` \| `"corporate-bodies"` \| `"controlled-vocabularies"` = `...`

###### metadata.detailCount?

`number` = `...`

###### metadata.recordCount?

`number` = `...`

###### metadata.scope?

`"current"` \| `"all"` = `...`

###### metadata.weekKey?

`string` = `...`

##### id

`string`

#### Returns

[`MEPDetails`](../../../types/ep/mep/interfaces/MEPDetails.md) \| `undefined`

***

### getAdoptedTextById()

> **getAdoptedTextById**(`docId`, `options?`): `Promise`\<[`AdoptedText`](../../../types/ep/activities/interfaces/AdoptedText.md)\>

Defined in: [clients/europeanParliamentClient.ts:988](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L988)

Returns a single adopted text by document ID.
**EP API Endpoint:** `GET /adopted-texts/{doc-id}`

#### Parameters

##### docId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`AdoptedText`](../../../types/ep/activities/interfaces/AdoptedText.md)\>

***

### getAdoptedTexts()

> **getAdoptedTexts**(`params?`): `Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`AdoptedText`](../../../types/ep/activities/interfaces/AdoptedText.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:975](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L975)

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

`Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`AdoptedText`](../../../types/ep/activities/interfaces/AdoptedText.md)\>\>

***

### getAdoptedTextsFeed()

> **getAdoptedTextsFeed**(`params?`): `Promise`\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:1009](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L1009)

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

`Promise`\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

***

### getCachedMEPs()

> `private` **getCachedMEPs**(`params`): `Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\> \| `null`\>

Defined in: [clients/europeanParliamentClient.ts:316](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L316)

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

###### live?

`boolean`

###### offset?

`number`

#### Returns

`Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\> \| `null`\>

***

### getCacheStats()

> **getCacheStats**(): `object`

Defined in: [clients/europeanParliamentClient.ts:246](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L246)

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

> **getCommitteeDocumentById**(`docId`, `options?`): `Promise`\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

Defined in: [clients/europeanParliamentClient.ts:875](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L875)

Returns a single committee document by ID.
**EP API Endpoint:** `GET /committee-documents/{doc-id}`

#### Parameters

##### docId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

***

### getCommitteeDocuments()

> **getCommitteeDocuments**(`params?`): `Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:800](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L800)

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

`Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getCommitteeDocumentsFeed()

> **getCommitteeDocumentsFeed**(`options?`): `Promise`\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:910](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L910)

Retrieves recently updated committee documents via the feed endpoint.
**EP API Endpoint:** `GET /committee-documents/feed`
Fixed-window feed — no parameters per OpenAPI spec.

#### Parameters

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

***

### getCommitteeInfo()

> **getCommitteeInfo**(`params`): `Promise`\<[`Committee`](../../../types/ep/committee/interfaces/Committee.md)\>

Defined in: [clients/europeanParliamentClient.ts:668](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L668)

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

###### live?

`boolean`

#### Returns

`Promise`\<[`Committee`](../../../types/ep/committee/interfaces/Committee.md)\>

Committee information

#### Security

Audit logged per GDPR Article 30

#### Performance

Cached: <100ms P50, <200ms P95. Uncached: <2s P99

#### See

https://data.europarl.europa.eu/api/v2/corporate-bodies

***

### getControlledVocabularies()

> **getControlledVocabularies**(`params?`): `Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:1076](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L1076)

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

`Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

***

### getControlledVocabulariesFeed()

> **getControlledVocabulariesFeed**(`options?`): `Promise`\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:1100](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L1100)

Retrieves recently updated controlled vocabularies via the feed endpoint.
**EP API Endpoint:** `GET /controlled-vocabularies/feed`
Fixed-window feed — no parameters per OpenAPI spec.

#### Parameters

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

***

### getControlledVocabularyById()

> **getControlledVocabularyById**(`vocId`, `options?`): `Promise`\<`Record`\<`string`, `unknown`\>\>

Defined in: [clients/europeanParliamentClient.ts:1088](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L1088)

Returns a single EP Controlled Vocabulary by ID.
**EP API Endpoint:** `GET /controlled-vocabularies/{voc-id}`

#### Parameters

##### vocId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>

***

### getCorporateBodies()

> **getCorporateBodies**(`params?`): `Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Committee`](../../../types/ep/committee/interfaces/Committee.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:730](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L730)

Returns the list of all EP Corporate Bodies.
**EP API Endpoint:** `GET /corporate-bodies`

#### Parameters

##### params?

###### abortSignal?

`AbortSignal`

###### limit?

`number`

###### offset?

`number`

#### Returns

`Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Committee`](../../../types/ep/committee/interfaces/Committee.md)\>\>

***

### getCorporateBodiesFeed()

> **getCorporateBodiesFeed**(`options?`): `Promise`\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:754](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L754)

Retrieves recently updated corporate bodies via the feed endpoint.
**EP API Endpoint:** `GET /corporate-bodies/feed`
Fixed-window feed — no parameters per OpenAPI spec.

#### Parameters

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

***

### getCorporateBodyById()

> **getCorporateBodyById**(`bodyId`, `options?`): `Promise`\<[`Committee`](../../../types/ep/committee/interfaces/Committee.md)\>

Defined in: [clients/europeanParliamentClient.ts:742](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L742)

Returns a single EP Corporate Body by body ID.
**EP API Endpoint:** `GET /corporate-bodies/{body-id}`

#### Parameters

##### bodyId

`string`

##### options?

###### abortSignal?

`AbortSignal`

###### includeMemberships?

`boolean`

#### Returns

`Promise`\<[`Committee`](../../../types/ep/committee/interfaces/Committee.md)\>

***

### getCurrentCorporateBodies()

> **getCurrentCorporateBodies**(`params?`): `Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Committee`](../../../types/ep/committee/interfaces/Committee.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:697](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L697)

Returns the list of all current EP Corporate Bodies for today's date.
**EP API Endpoint:** `GET /corporate-bodies/show-current`

#### Parameters

##### params?

###### abortSignal?

`AbortSignal`

###### limit?

`number`

###### live?

`boolean`

###### offset?

`number`

#### Returns

`Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Committee`](../../../types/ep/committee/interfaces/Committee.md)\>\>

***

### getCurrentMEPs()

> **getCurrentMEPs**(`params?`): `Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:392](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L392)

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

###### live?

`boolean`

###### offset?

`number`

#### Returns

`Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>\>

***

### getDocumentById()

> **getDocumentById**(`docId`, `options?`): `Promise`\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

Defined in: [clients/europeanParliamentClient.ts:851](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L851)

Returns a single document by ID.
**EP API Endpoint:** `GET /documents/{doc-id}`

#### Parameters

##### docId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

***

### getDocumentsFeed()

> **getDocumentsFeed**(`options?`): `Promise`\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:892](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L892)

Retrieves recently updated documents via the feed endpoint.
**EP API Endpoint:** `GET /documents/feed`
Fixed-window feed — no parameters per OpenAPI spec.

#### Parameters

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

***

### getEventById()

> **getEventById**(`eventId`, `options?`): `Promise`\<[`EPEvent`](../../../types/ep/activities/interfaces/EPEvent.md)\>

Defined in: [clients/europeanParliamentClient.ts:593](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L593)

Returns a single EP event by ID.
**EP API Endpoint:** `GET /events/{event-id}`

#### Parameters

##### eventId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`EPEvent`](../../../types/ep/activities/interfaces/EPEvent.md)\>

***

### getEvents()

> **getEvents**(`params?`): `Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`EPEvent`](../../../types/ep/activities/interfaces/EPEvent.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:581](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L581)

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

`Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`EPEvent`](../../../types/ep/activities/interfaces/EPEvent.md)\>\>

***

### getEventsFeed()

> **getEventsFeed**(`params?`): `Promise`\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:601](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L601)

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

`Promise`\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

***

### getExternalDocumentById()

> **getExternalDocumentById**(`docId`, `options?`): `Promise`\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

Defined in: [clients/europeanParliamentClient.ts:883](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L883)

Returns a single external document by ID.
**EP API Endpoint:** `GET /external-documents/{doc-id}`

#### Parameters

##### docId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

***

### getExternalDocuments()

> **getExternalDocuments**(`params?`): `Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:839](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L839)

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

`Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getExternalDocumentsFeed()

> **getExternalDocumentsFeed**(`params?`): `Promise`\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:927](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L927)

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

`Promise`\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

***

### getHomonymMEPs()

> **getHomonymMEPs**(`params?`): `Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:435](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L435)

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

`Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>\>

***

### getIncomingMEPs()

> **getIncomingMEPs**(`params?`): `Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:411](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L411)

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

`Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>\>

***

### getMeetingActivities()

> **getMeetingActivities**(`sittingId`, `params?`): `Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MeetingActivity`](../../../types/ep/activities/interfaces/MeetingActivity.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:515](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L515)

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

`Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MeetingActivity`](../../../types/ep/activities/interfaces/MeetingActivity.md)\>\>

***

### getMeetingById()

> **getMeetingById**(`eventId`, `options?`): `Promise`\<[`PlenarySession`](../../../types/ep/plenary/interfaces/PlenarySession.md)\>

Defined in: [clients/europeanParliamentClient.ts:570](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L570)

Returns a single EP meeting by ID.
**EP API Endpoint:** `GET /meetings/{event-id}`

#### Parameters

##### eventId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`PlenarySession`](../../../types/ep/plenary/interfaces/PlenarySession.md)\>

***

### getMeetingDecisions()

> **getMeetingDecisions**(`sittingId`, `params?`): `Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:526](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L526)

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

`Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getMeetingForeseenActivities()

> **getMeetingForeseenActivities**(`sittingId`, `params?`): `Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MeetingActivity`](../../../types/ep/activities/interfaces/MeetingActivity.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:537](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L537)

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

`Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MeetingActivity`](../../../types/ep/activities/interfaces/MeetingActivity.md)\>\>

***

### getMeetingPlenarySessionDocumentItems()

> **getMeetingPlenarySessionDocumentItems**(`sittingId`, `params?`): `Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:559](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L559)

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

`Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getMeetingPlenarySessionDocuments()

> **getMeetingPlenarySessionDocuments**(`sittingId`, `params?`): `Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:548](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L548)

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

`Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getMEPDeclarationById()

> **getMEPDeclarationById**(`docId`, `options?`): `Promise`\<[`MEPDeclaration`](../../../types/ep/activities/interfaces/MEPDeclaration.md)\>

Defined in: [clients/europeanParliamentClient.ts:462](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L462)

Returns a single MEP declaration by document ID.
**EP API Endpoint:** `GET /meps-declarations/{doc-id}`

#### Parameters

##### docId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`MEPDeclaration`](../../../types/ep/activities/interfaces/MEPDeclaration.md)\>

#### Gdpr

Declarations contain personal financial data – access is audit-logged

***

### getMEPDeclarations()

> **getMEPDeclarations**(`params?`): `Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEPDeclaration`](../../../types/ep/activities/interfaces/MEPDeclaration.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:448](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L448)

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

`Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEPDeclaration`](../../../types/ep/activities/interfaces/MEPDeclaration.md)\>\>

#### Gdpr

Declarations contain personal financial data – access is audit-logged

***

### getMEPDeclarationsFeed()

> **getMEPDeclarationsFeed**(`params?`): `Promise`\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:482](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L482)

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

`Promise`\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

***

### getMEPDetails()

> **getMEPDetails**(`id`, `options?`): `Promise`\<[`MEPDetails`](../../../types/ep/mep/interfaces/MEPDetails.md)\>

Defined in: [clients/europeanParliamentClient.ts:371](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L371)

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

###### live?

`boolean`

#### Returns

`Promise`\<[`MEPDetails`](../../../types/ep/mep/interfaces/MEPDetails.md)\>

Detailed MEP information

#### Security

Personal data access logged per GDPR Article 30

#### Performance

Cached: <100ms P50, <200ms P95. Uncached: <2s P99

#### See

https://data.europarl.europa.eu/api/v2/meps/{id}

***

### getMEPs()

> **getMEPs**(`params`): `Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:346](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L346)

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

###### live?

`boolean`

###### offset?

`number`

#### Returns

`Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>\>

Paginated MEP list

#### Security

Personal data access logged per GDPR Article 30

#### Performance

Cached: <100ms P50, <200ms P95. Uncached: <2s P99

#### See

https://data.europarl.europa.eu/api/v2/meps

***

### getMEPsFeed()

> **getMEPsFeed**(`params?`): `Promise`\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:470](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L470)

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

`Promise`\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

***

### getOutgoingMEPs()

> **getOutgoingMEPs**(`params?`): `Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:423](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L423)

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

`Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>\>

***

### getParliamentaryQuestionById()

> **getParliamentaryQuestionById**(`docId`, `options?`): `Promise`\<[`ParliamentaryQuestion`](../../../types/ep/question/interfaces/ParliamentaryQuestion.md)\>

Defined in: [clients/europeanParliamentClient.ts:1056](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L1056)

Returns a single parliamentary question by document ID.
**EP API Endpoint:** `GET /parliamentary-questions/{doc-id}`

#### Parameters

##### docId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`ParliamentaryQuestion`](../../../types/ep/question/interfaces/ParliamentaryQuestion.md)\>

***

### getParliamentaryQuestions()

> **getParliamentaryQuestions**(`params`): `Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`ParliamentaryQuestion`](../../../types/ep/question/interfaces/ParliamentaryQuestion.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:1038](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L1038)

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

`Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`ParliamentaryQuestion`](../../../types/ep/question/interfaces/ParliamentaryQuestion.md)\>\>

Paginated parliamentary questions list

#### Security

Audit logged per GDPR Article 30

#### Performance

Cached: <100ms P50, <200ms P95. Uncached: <2s P99

#### See

https://data.europarl.europa.eu/api/v2/parliamentary-questions

***

### getParliamentaryQuestionsFeed()

> **getParliamentaryQuestionsFeed**(`options?`): `Promise`\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:1068](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L1068)

Retrieves recently updated parliamentary questions via the feed endpoint.
**EP API Endpoint:** `GET /parliamentary-questions/feed`
Fixed-window feed — no parameters per OpenAPI spec.

#### Parameters

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

***

### getPlenaryDocumentById()

> **getPlenaryDocumentById**(`docId`, `options?`): `Promise`\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

Defined in: [clients/europeanParliamentClient.ts:859](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L859)

Returns a single plenary document by ID.
**EP API Endpoint:** `GET /plenary-documents/{doc-id}`

#### Parameters

##### docId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

***

### getPlenaryDocuments()

> **getPlenaryDocuments**(`params?`): `Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:784](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L784)

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

`Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getPlenaryDocumentsFeed()

> **getPlenaryDocumentsFeed**(`options?`): `Promise`\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:901](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L901)

Retrieves recently updated plenary documents via the feed endpoint.
**EP API Endpoint:** `GET /plenary-documents/feed`
Fixed-window feed — no parameters per OpenAPI spec.

#### Parameters

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

***

### getPlenarySessionDocumentById()

> **getPlenarySessionDocumentById**(`docId`, `options?`): `Promise`\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

Defined in: [clients/europeanParliamentClient.ts:867](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L867)

Returns a single plenary session document by ID.
**EP API Endpoint:** `GET /plenary-session-documents/{doc-id}`

#### Parameters

##### docId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>

***

### getPlenarySessionDocumentItems()

> **getPlenarySessionDocumentItems**(`params?`): `Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:824](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L824)

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

`Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getPlenarySessionDocuments()

> **getPlenarySessionDocuments**(`params?`): `Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:812](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L812)

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

`Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

***

### getPlenarySessionDocumentsFeed()

> **getPlenarySessionDocumentsFeed**(`options?`): `Promise`\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:919](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L919)

Retrieves recently updated plenary session documents via the feed endpoint.
**EP API Endpoint:** `GET /plenary-session-documents/feed`
Fixed-window feed — no parameters per OpenAPI spec.

#### Parameters

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

***

### getPlenarySessions()

> **getPlenarySessions**(`params`): `Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`PlenarySession`](../../../types/ep/plenary/interfaces/PlenarySession.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:499](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L499)

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

`Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`PlenarySession`](../../../types/ep/plenary/interfaces/PlenarySession.md)\>\>

Paginated plenary session list

#### Performance

Cached: <100ms P50, <200ms P95. Uncached: <2s P99

#### See

https://data.europarl.europa.eu/api/v2/meetings

***

### getProcedureById()

> **getProcedureById**(`processId`, `options?`): `Promise`\<[`Procedure`](../../../types/ep/activities/interfaces/Procedure.md)\>

Defined in: [clients/europeanParliamentClient.ts:956](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L956)

Returns a single procedure by ID.
**EP API Endpoint:** `GET /procedures/{process-id}`

#### Parameters

##### processId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`Procedure`](../../../types/ep/activities/interfaces/Procedure.md)\>

#### Throws

When the procedure is not found (404)

***

### getProcedureEventById()

> **getProcedureEventById**(`processId`, `eventId`, `options?`): `Promise`\<[`EPEvent`](../../../types/ep/activities/interfaces/EPEvent.md)\>

Defined in: [clients/europeanParliamentClient.ts:1025](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L1025)

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

`Promise`\<[`EPEvent`](../../../types/ep/activities/interfaces/EPEvent.md)\>

***

### getProcedureEvents()

> **getProcedureEvents**(`processId`, `params?`): `Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`EPEvent`](../../../types/ep/activities/interfaces/EPEvent.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:964](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L964)

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

`Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`EPEvent`](../../../types/ep/activities/interfaces/EPEvent.md)\>\>

***

### getProcedures()

> **getProcedures**(`params?`): `Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Procedure`](../../../types/ep/activities/interfaces/Procedure.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:943](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L943)

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

`Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Procedure`](../../../types/ep/activities/interfaces/Procedure.md)\>\>

***

### getProceduresFeed()

> **getProceduresFeed**(`params?`): `Promise`\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

Defined in: [clients/europeanParliamentClient.ts:996](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L996)

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

`Promise`\<[`JSONLDResponse`](../../ep/baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

***

### getSpeechById()

> **getSpeechById**(`speechId`, `options?`): `Promise`\<[`Speech`](../../../types/ep/activities/interfaces/Speech.md)\>

Defined in: [clients/europeanParliamentClient.ts:655](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L655)

Returns a single speech by ID.
**EP API Endpoint:** `GET /speeches/{speech-id}`

#### Parameters

##### speechId

`string`

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`Speech`](../../../types/ep/activities/interfaces/Speech.md)\>

***

### getSpeeches()

> **getSpeeches**(`params?`): `Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Speech`](../../../types/ep/activities/interfaces/Speech.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:641](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L641)

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

`Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Speech`](../../../types/ep/activities/interfaces/Speech.md)\>\>

***

### getVotingRecords()

> **getVotingRecords**(`params`): `Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`VotingRecord`](../../../types/ep/plenary/interfaces/VotingRecord.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:622](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L622)

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

`Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`VotingRecord`](../../../types/ep/plenary/interfaces/VotingRecord.md)\>\>

Paginated voting records list

#### Security

Audit logged per GDPR Article 30

#### Performance

Cached: <100ms P50, <200ms P95. Uncached: <2s P99

#### See

https://data.europarl.europa.eu/api/v2/meetings/{sitting-id}/vote-results

***

### matchesCommittee()

> `private` **matchesCommittee**(`committees`, `requested`): `boolean`

Defined in: [clients/europeanParliamentClient.ts:295](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L295)

#### Parameters

##### committees

readonly `string`[]

##### requested

`string`

#### Returns

`boolean`

***

### normalizeMEPIdentifier()

> `private` **normalizeMEPIdentifier**(`id`): `string`

Defined in: [clients/europeanParliamentClient.ts:250](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L250)

#### Parameters

##### id

`string`

#### Returns

`string`

***

### paginateCachedMEPs()

> `private` **paginateCachedMEPs**(`meps`, `params`): [`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>

Defined in: [clients/europeanParliamentClient.ts:273](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L273)

#### Parameters

##### meps

[`MEP`](../../../types/ep/mep/interfaces/MEP.md)[]

##### params

###### country?

`string`

###### group?

`string`

###### limit?

`number`

###### offset?

`number`

#### Returns

[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`MEP`](../../../types/ep/mep/interfaces/MEP.md)\>

***

### searchDocuments()

> **searchDocuments**(`params`): `Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

Defined in: [clients/europeanParliamentClient.ts:767](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L767)

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

`Promise`\<[`PaginatedResponse`](../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)\>\>

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

Defined in: [clients/europeanParliamentClient.ts:194](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/europeanParliamentClient.ts#L194)

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
