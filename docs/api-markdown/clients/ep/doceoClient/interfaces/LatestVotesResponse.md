[**European Parliament MCP Server API v1.3.27**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/doceoClient](../README.md) / LatestVotesResponse

# Interface: LatestVotesResponse

Defined in: [clients/ep/doceoClient.ts:91](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L91)

Response structure for latest votes.

## Properties

### data

> **data**: [`LatestVoteRecord`](../../doceoXmlParser/interfaces/LatestVoteRecord.md)[]

Defined in: [clients/ep/doceoClient.ts:93](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L93)

Vote records

***

### datesAvailable

> **datesAvailable**: `string`[]

Defined in: [clients/ep/doceoClient.ts:97](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L97)

Dates that were successfully fetched

***

### datesUnavailable

> **datesUnavailable**: `string`[]

Defined in: [clients/ep/doceoClient.ts:99](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L99)

Dates that returned errors (document not yet published)

***

### hasMore

> **hasMore**: `boolean`

Defined in: [clients/ep/doceoClient.ts:109](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L109)

***

### limit

> **limit**: `number`

Defined in: [clients/ep/doceoClient.ts:107](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L107)

Pagination

***

### offset

> **offset**: `number`

Defined in: [clients/ep/doceoClient.ts:108](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L108)

***

### source

> **source**: `object`

Defined in: [clients/ep/doceoClient.ts:101](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L101)

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

Defined in: [clients/ep/doceoClient.ts:95](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L95)

Total count of available records
