[**European Parliament MCP Server API v1.3.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/doceoClient](../README.md) / LatestVotesResponse

# Interface: LatestVotesResponse

Defined in: [clients/ep/doceoClient.ts:114](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L114)

Response structure for latest votes.

## Properties

### data

> **data**: [`LatestVoteRecord`](../../doceoXmlParser/interfaces/LatestVoteRecord.md)[]

Defined in: [clients/ep/doceoClient.ts:116](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L116)

Vote records

***

### datesAvailable

> **datesAvailable**: `string`[]

Defined in: [clients/ep/doceoClient.ts:120](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L120)

Dates that were successfully fetched

***

### datesUnavailable

> **datesUnavailable**: `string`[]

Defined in: [clients/ep/doceoClient.ts:122](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L122)

Dates that returned errors (document not yet published)

***

### hasMore

> **hasMore**: `boolean`

Defined in: [clients/ep/doceoClient.ts:132](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L132)

***

### limit

> **limit**: `number`

Defined in: [clients/ep/doceoClient.ts:130](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L130)

Pagination

***

### offset

> **offset**: `number`

Defined in: [clients/ep/doceoClient.ts:131](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L131)

***

### source

> **source**: `object`

Defined in: [clients/ep/doceoClient.ts:124](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L124)

Data source metadata

#### term

> **term**: `number`

#### type

> **type**: `"DOCEO_XML"`

#### urls

> **urls**: `string`[]

***

### total

> **total**: `number`

Defined in: [clients/ep/doceoClient.ts:118](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L118)

Total count of available records
