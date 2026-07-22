[**European Parliament MCP Server API v1.4.4**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/doceoClient](../README.md) / DoceoClient

# Class: DoceoClient

Defined in: [clients/ep/doceoClient.ts:124](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L124)

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

Defined in: [clients/ep/doceoClient.ts:127](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L127)

#### Parameters

##### term?

`number` = `CURRENT_PARLIAMENTARY_TERM`

#### Returns

`DoceoClient`

## Properties

### term

> `private` `readonly` **term**: `number`

Defined in: [clients/ep/doceoClient.ts:125](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L125)

## Methods

### fetchRcvForDate()

> **fetchRcvForDate**(`date`, `term?`, `abortSignal?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`RcvVoteResult`](../../doceoXmlParser/interfaces/RcvVoteResult.md)[]\>

Defined in: [clients/ep/doceoClient.ts:190](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L190)

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

Defined in: [clients/ep/doceoClient.ts:222](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L222)

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

#### Private

***

### fetchVotForDate()

> **fetchVotForDate**(`date`, `term?`, `abortSignal?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`VotVoteResult`](../../doceoXmlParser/interfaces/VotVoteResult.md)[]\>

Defined in: [clients/ep/doceoClient.ts:207](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L207)

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

Defined in: [clients/ep/doceoClient.ts:137](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L137)

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

Defined in: [clients/ep/doceoClient.ts:272](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L272)

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

Defined in: [clients/ep/doceoClient.ts:253](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L253)

Determine which dates to query based on params.

#### Parameters

##### params

[`GetLatestVotesParams`](../interfaces/GetLatestVotesParams.md)

#### Returns

`string`[]

#### Private
