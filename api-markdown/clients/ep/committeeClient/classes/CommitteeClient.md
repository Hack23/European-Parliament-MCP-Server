[**European Parliament MCP Server API v1.3.40**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/committeeClient](../README.md) / CommitteeClient

# Class: CommitteeClient

Defined in: [clients/ep/committeeClient.ts:36](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/committeeClient.ts#L36)

Sub-client for committee/corporate-body EP API endpoints.

## Extends

- [`BaseEPClient`](../../baseClient/classes/BaseEPClient.md)

## Constructors

### Constructor

> **new CommitteeClient**(`config?`, `shared?`): `CommitteeClient`

Defined in: [clients/ep/committeeClient.ts:37](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/committeeClient.ts#L37)

#### Parameters

##### config?

[`EPClientConfig`](../../baseClient/interfaces/EPClientConfig.md) = `{}`

##### shared?

[`EPSharedResources`](../../baseClient/interfaces/EPSharedResources.md)

#### Returns

`CommitteeClient`

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

> `protected` `readonly` **cache**: `LRUCache`\<`string`, `Record`\<`string`, `unknown`\>\>

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

### applyCommitteeMemberships()

> `private` **applyCommitteeMemberships**(`committee`, `membershipSummary`): [`Committee`](../../../../types/ep/committee/interfaces/Committee.md)

Defined in: [clients/ep/committeeClient.ts:328](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/committeeClient.ts#L328)

#### Parameters

##### committee

[`Committee`](../../../../types/ep/committee/interfaces/Committee.md)

##### membershipSummary

###### members

`string`[]

###### viceChairs

`string`[]

###### chair?

`string`

#### Returns

[`Committee`](../../../../types/ep/committee/interfaces/Committee.md)

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

### collectCommitteeOrganizationCandidates()

> `private` **collectCommitteeOrganizationCandidates**(`apiData`, `committeeAbbreviation`): `string`[]

Defined in: [clients/ep/committeeClient.ts:80](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/committeeClient.ts#L80)

#### Parameters

##### apiData

`Record`\<`string`, `unknown`\>

##### committeeAbbreviation

`string`

#### Returns

`string`[]

***

### collectMembershipsFromBatch()

> `private` **collectMembershipsFromBatch**(`meps`, `organizationCandidates`, `abortSignal?`): `Promise`\<\{ `memberIds`: `Set`\<`string`\>; `viceChairIds`: `Set`\<`string`\>; `chairId?`: `string`; \}\>

Defined in: [clients/ep/committeeClient.ts:204](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/committeeClient.ts#L204)

#### Parameters

##### meps

`unknown`[]

##### organizationCandidates

`string`[]

##### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<\{ `memberIds`: `Set`\<`string`\>; `viceChairIds`: `Set`\<`string`\>; `chairId?`: `string`; \}\>

***

### enrichCommitteeMembership()

> `private` **enrichCommitteeMembership**(`committee`, `apiData`, `abortSignal?`): `Promise`\<[`Committee`](../../../../types/ep/committee/interfaces/Committee.md)\>

Defined in: [clients/ep/committeeClient.ts:105](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/committeeClient.ts#L105)

#### Parameters

##### committee

[`Committee`](../../../../types/ep/committee/interfaces/Committee.md)

##### apiData

`Record`\<`string`, `unknown`\>

##### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`Committee`](../../../../types/ep/committee/interfaces/Committee.md)\>

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

`Record`\<`string`, `unknown`\>

Optional query parameters (same value passed to [get](../../baseClient/classes/BaseEPClient.md#get))

#### Returns

`void`

#### Protected

#### Inherited from

[`BaseEPClient`](../../baseClient/classes/BaseEPClient.md).[`evictFromCache`](../../baseClient/classes/BaseEPClient.md#evictfromcache)

***

### extractMembershipSummary()

> `private` **extractMembershipSummary**(`details`, `organizationCandidates`): `object`

Defined in: [clients/ep/committeeClient.ts:284](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/committeeClient.ts#L284)

#### Parameters

##### details

`Record`\<`string`, `unknown`\>

##### organizationCandidates

`string`[]

#### Returns

`object`

##### chair

> **chair**: `boolean`

##### member

> **member**: `boolean`

##### viceChair

> **viceChair**: `boolean`

***

### fetchCommitteeDirectly()

> `private` **fetchCommitteeDirectly**(`bodyId`, `abortSignal?`): `Promise`\<[`Committee`](../../../../types/ep/committee/interfaces/Committee.md) \| `null`\>

Defined in: [clients/ep/committeeClient.ts:373](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/committeeClient.ts#L373)

Attempts a direct corporate-body lookup by ID.

#### Parameters

##### bodyId

`string`

##### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`Committee`](../../../../types/ep/committee/interfaces/Committee.md) \| `null`\>

#### Private

***

### get()

> `protected` **get**\<`T`\>(`endpoint`, `params?`, `minimumTimeoutMs?`, `abortSignal?`): `Promise`\<`T`\>

Defined in: [clients/ep/baseClient.ts:685](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/baseClient.ts#L685)

Executes a cached, rate-limited GET request to the EP API.

#### Type Parameters

##### T

`T` *extends* `Record`\<`string`, `unknown`\>

Expected response type (extends `Record<string, unknown>`)

#### Parameters

##### endpoint

`string`

API endpoint path (relative to `baseURL`)

##### params?

`Record`\<`string`, `unknown`\>

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

`Promise`\<`T`\>

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

### getCommitteeFilterValue()

> `private` **getCommitteeFilterValue**(`committee`): `string`

Defined in: [clients/ep/committeeClient.ts:68](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/committeeClient.ts#L68)

#### Parameters

##### committee

[`Committee`](../../../../types/ep/committee/interfaces/Committee.md)

#### Returns

`string`

***

### getCommitteeInfo()

> **getCommitteeInfo**(`params`): `Promise`\<[`Committee`](../../../../types/ep/committee/interfaces/Committee.md)\>

Defined in: [clients/ep/committeeClient.ts:417](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/committeeClient.ts#L417)

Retrieves committee (corporate body) information by ID or abbreviation.

**EP API Endpoint:** `GET /corporate-bodies/{body-id}` or `GET /corporate-bodies`

#### Parameters

##### params

id or abbreviation of the committee, with optional `abortSignal`

###### abbreviation?

`string`

###### abortSignal?

`AbortSignal`

###### id?

`string`

#### Returns

`Promise`\<[`Committee`](../../../../types/ep/committee/interfaces/Committee.md)\>

Committee information

#### Security

Audit logged per GDPR Article 30

***

### getCorporateBodiesFeed()

> **getCorporateBodiesFeed**(`options?`): `Promise`\<[`JSONLDResponse`](../../baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

Defined in: [clients/ep/committeeClient.ts:447](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/committeeClient.ts#L447)

Retrieves recently updated corporate bodies via the feed endpoint.
**EP API Endpoint:** `GET /corporate-bodies/feed`

Fixed-window feed — no `timeframe` parameter per OpenAPI spec.
Extended timeout applied (120 s minimum).

#### Parameters

##### options?

###### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`JSONLDResponse`](../../baseClient/interfaces/JSONLDResponse.md)\<`Record`\<`string`, `unknown`\>\>\>

***

### getCurrentCorporateBodies()

> **getCurrentCorporateBodies**(`params?`): `Promise`\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Committee`](../../../../types/ep/committee/interfaces/Committee.md)\>\>

Defined in: [clients/ep/committeeClient.ts:457](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/committeeClient.ts#L457)

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

`Promise`\<[`PaginatedResponse`](../../../../types/ep/common/interfaces/PaginatedResponse.md)\<[`Committee`](../../../../types/ep/committee/interfaces/Committee.md)\>\>

***

### getMembershipRoleCode()

> `private` **getMembershipRoleCode**(`membership`): `string`

Defined in: [clients/ep/committeeClient.ts:323](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/committeeClient.ts#L323)

#### Parameters

##### membership

`Record`\<`string`, `unknown`\>

#### Returns

`string`

***

### getMEPMembershipSummary()

> `private` **getMEPMembershipSummary**(`mep`, `organizationCandidates`, `abortSignal?`): `Promise`\<\{ `chair`: `boolean`; `member`: `boolean`; `mepId`: `string`; `viceChair`: `boolean`; \}\>

Defined in: [clients/ep/committeeClient.ts:240](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/committeeClient.ts#L240)

#### Parameters

##### mep

`Record`\<`string`, `unknown`\>

##### organizationCandidates

`string`[]

##### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<\{ `chair`: `boolean`; `member`: `boolean`; `mepId`: `string`; `viceChair`: `boolean`; \}\>

***

### isRecord()

> `private` **isRecord**(`value`): `value is Record<string, unknown>`

Defined in: [clients/ep/committeeClient.ts:64](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/committeeClient.ts#L64)

#### Parameters

##### value

`unknown`

#### Returns

`value is Record<string, unknown>`

***

### loadCommitteeMemberships()

> `private` **loadCommitteeMemberships**(`filterValue`, `organizationCandidates`, `abortSignal?`): `Promise`\<\{ `members`: `string`[]; `viceChairs`: `string`[]; `chair?`: `string`; \}\>

Defined in: [clients/ep/committeeClient.ts:149](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/committeeClient.ts#L149)

#### Parameters

##### filterValue

`string`

##### organizationCandidates

`string`[]

##### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<\{ `members`: `string`[]; `viceChairs`: `string`[]; `chair?`: `string`; \}\>

***

### loadMEPMembershipSummaryFromDetails()

> `private` **loadMEPMembershipSummaryFromDetails**(`mepId`, `organizationCandidates`, `abortSignal?`): `Promise`\<\{ `chair`: `boolean`; `member`: `boolean`; `viceChair`: `boolean`; \}\>

Defined in: [clients/ep/committeeClient.ts:263](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/committeeClient.ts#L263)

#### Parameters

##### mepId

`string`

##### organizationCandidates

`string`[]

##### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<\{ `chair`: `boolean`; `member`: `boolean`; `viceChair`: `boolean`; \}\>

***

### matchesCommitteeOrganization()

> `private` **matchesCommitteeOrganization**(`membership`, `organizationCandidates`): `boolean`

Defined in: [clients/ep/committeeClient.ts:312](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/committeeClient.ts#L312)

#### Parameters

##### membership

`Record`\<`string`, `unknown`\>

##### organizationCandidates

`string`[]

#### Returns

`boolean`

***

### normalizeMEPId()

> `private` **normalizeMEPId**(`mepId`): `string`

Defined in: [clients/ep/committeeClient.ts:45](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/committeeClient.ts#L45)

#### Parameters

##### mepId

`unknown`

#### Returns

`string`

***

### normalizeOrganizationId()

> `private` **normalizeOrganizationId**(`value`): `string`

Defined in: [clients/ep/committeeClient.ts:58](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/committeeClient.ts#L58)

#### Parameters

##### value

`string`

#### Returns

`string`

***

### resolveCommittee()

> `private` **resolveCommittee**(`searchTerm`, `abortSignal?`): `Promise`\<[`Committee`](../../../../types/ep/committee/interfaces/Committee.md)\>

Defined in: [clients/ep/committeeClient.ts:357](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/committeeClient.ts#L357)

Resolves a committee by trying direct lookup then list search.

#### Parameters

##### searchTerm

`string`

##### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`Committee`](../../../../types/ep/committee/interfaces/Committee.md)\>

#### Throws

If committee not found

#### Private

***

### searchCommitteeInList()

> `private` **searchCommitteeInList**(`searchTerm`, `abortSignal?`): `Promise`\<[`Committee`](../../../../types/ep/committee/interfaces/Committee.md) \| `null`\>

Defined in: [clients/ep/committeeClient.ts:392](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/committeeClient.ts#L392)

Searches the corporate-bodies list for a matching committee.

#### Parameters

##### searchTerm

`string`

##### abortSignal?

`AbortSignal`

#### Returns

`Promise`\<[`Committee`](../../../../types/ep/committee/interfaces/Committee.md) \| `null`\>

#### Private

***

### transformCorporateBody()

> `private` **transformCorporateBody**(`apiData`): [`Committee`](../../../../types/ep/committee/interfaces/Committee.md)

Defined in: [clients/ep/committeeClient.ts:41](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/committeeClient.ts#L41)

#### Parameters

##### apiData

`Record`\<`string`, `unknown`\>

#### Returns

[`Committee`](../../../../types/ep/committee/interfaces/Committee.md)
