[**European Parliament MCP Server API v1.3.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/doceoClient](../README.md) / DoceoClient

# Class: DoceoClient

Defined in: [clients/ep/doceoClient.ts:147](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L147)

Client for fetching plenary vote data from the EP DOCEO XML endpoint.

This provides more recent vote data than the EP Open Data API, which has
a delay of several weeks for publishing roll-call vote results.

## Security

- URL construction is validated (HTTPS only, known host)
- XML parsing uses regex-based extraction (no eval/dynamic code execution)
- Response size limited to prevent memory exhaustion
- All access is audit-logged

## Constructors

### Constructor

> **new DoceoClient**(`term?`): `DoceoClient`

Defined in: [clients/ep/doceoClient.ts:150](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L150)

#### Parameters

##### term?

`number` = `CURRENT_PARLIAMENTARY_TERM`

#### Returns

`DoceoClient`

## Properties

### term

> `private` `readonly` **term**: `number`

Defined in: [clients/ep/doceoClient.ts:148](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L148)

## Methods

### fetchRcvForDate()

> **fetchRcvForDate**(`date`, `term?`, `abortSignal?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`RcvVoteResult`](../../doceoXmlParser/interfaces/RcvVoteResult.md)[]\>

Defined in: [clients/ep/doceoClient.ts:215](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L215)

Fetch roll-call vote data for a specific date.

#### Parameters

##### date

`string`

Date in YYYY-MM-DD format

##### term?

`number` = `...`

##### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`RcvVoteResult`](../../doceoXmlParser/interfaces/RcvVoteResult.md)[]\>

Parsed RCV results, or empty array if unavailable

***

### fetchVotesForDate()

> `private` **fetchVotesForDate**(`date`, `term`, `includeIndividual`, `abortSignal?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `url`: `string`; `votes`: [`LatestVoteRecord`](../../doceoXmlParser/interfaces/LatestVoteRecord.md)[]; \} \| `null`\>

Defined in: [clients/ep/doceoClient.ts:247](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L247)

Fetch votes for a single date, trying RCV first then VOT.

#### Parameters

##### date

`string`

##### term

`number`

##### includeIndividual

`boolean`

##### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `url`: `string`; `votes`: [`LatestVoteRecord`](../../doceoXmlParser/interfaces/LatestVoteRecord.md)[]; \} \| `null`\>

***

### fetchVotForDate()

> **fetchVotForDate**(`date`, `term?`, `abortSignal?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`VotVoteResult`](../../doceoXmlParser/interfaces/VotVoteResult.md)[]\>

Defined in: [clients/ep/doceoClient.ts:232](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L232)

Fetch aggregate vote results for a specific date.

#### Parameters

##### date

`string`

Date in YYYY-MM-DD format

##### term?

`number` = `...`

##### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`VotVoteResult`](../../doceoXmlParser/interfaces/VotVoteResult.md)[]\>

Parsed VOT results, or empty array if unavailable

***

### fetchXml()

> `private` **fetchXml**(`url`, `abortSignal?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string` \| `null`\>

Defined in: [clients/ep/doceoClient.ts:160](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L160)

Fetch a single XML document from DOCEO.

#### Parameters

##### url

`string`

Full URL to the XML document

##### abortSignal?

`AbortSignal`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string` \| `null`\>

Raw XML string, or null if document not available

***

### getLatestVotes()

> **getLatestVotes**(`params?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LatestVotesResponse`](../interfaces/LatestVotesResponse.md)\>

Defined in: [clients/ep/doceoClient.ts:299](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L299)

Get the latest votes from DOCEO XML sources.

Attempts to fetch both RCV (individual MEP votes) and VOT (aggregate results)
for each day in the plenary week. RCV data is preferred as it includes
individual MEP positions and political group breakdowns.

#### Parameters

##### params?

[`GetLatestVotesParams`](../interfaces/GetLatestVotesParams.md) = `{}`

Query parameters

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`LatestVotesResponse`](../interfaces/LatestVotesResponse.md)\>

Latest votes response with available data

#### Security

Audit-logged per GDPR Article 30

***

### resolveDates()

> `private` **resolveDates**(`params`): `string`[]

Defined in: [clients/ep/doceoClient.ts:280](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L280)

Determine which dates to query based on params.

#### Parameters

##### params

[`GetLatestVotesParams`](../interfaces/GetLatestVotesParams.md)

#### Returns

`string`[]
