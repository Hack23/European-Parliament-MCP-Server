[**European Parliament MCP Server API v1.3.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/doceoClient](../README.md) / GetLatestVotesParams

# Interface: GetLatestVotesParams

Defined in: [clients/ep/doceoClient.ts:94](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L94)

Parameters for fetching latest votes from DOCEO.

## Properties

### abortSignal?

> `optional` **abortSignal?**: `AbortSignal`

Defined in: [clients/ep/doceoClient.ts:108](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L108)

Optional cancellation signal for bounded internal enrichment calls

***

### date?

> `optional` **date?**: `string`

Defined in: [clients/ep/doceoClient.ts:96](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L96)

Specific date (YYYY-MM-DD) to fetch votes for

***

### includeIndividualVotes?

> `optional` **includeIndividualVotes?**: `boolean`

Defined in: [clients/ep/doceoClient.ts:102](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L102)

Whether to include individual MEP vote positions from RCV data

***

### limit?

> `optional` **limit?**: `number`

Defined in: [clients/ep/doceoClient.ts:104](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L104)

Maximum number of vote records to return

***

### offset?

> `optional` **offset?**: `number`

Defined in: [clients/ep/doceoClient.ts:106](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L106)

Pagination offset

***

### term?

> `optional` **term?**: `number`

Defined in: [clients/ep/doceoClient.ts:100](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L100)

Parliamentary term number (defaults to 10)

***

### weekStart?

> `optional` **weekStart?**: `string`

Defined in: [clients/ep/doceoClient.ts:98](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L98)

Start of plenary week (Monday, YYYY-MM-DD). If omitted, uses most recent Monday.
