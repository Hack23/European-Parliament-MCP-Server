[**European Parliament MCP Server API v1.3.20**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/doceoClient](../README.md) / GetLatestVotesParams

# Interface: GetLatestVotesParams

Defined in: [clients/ep/doceoClient.ts:71](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L71)

Parameters for fetching latest votes from DOCEO.

## Properties

### abortSignal?

> `optional` **abortSignal?**: `AbortSignal`

Defined in: [clients/ep/doceoClient.ts:85](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L85)

Optional cancellation signal for bounded internal enrichment calls

***

### date?

> `optional` **date?**: `string`

Defined in: [clients/ep/doceoClient.ts:73](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L73)

Specific date (YYYY-MM-DD) to fetch votes for

***

### includeIndividualVotes?

> `optional` **includeIndividualVotes?**: `boolean`

Defined in: [clients/ep/doceoClient.ts:79](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L79)

Whether to include individual MEP vote positions from RCV data

***

### limit?

> `optional` **limit?**: `number`

Defined in: [clients/ep/doceoClient.ts:81](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L81)

Maximum number of vote records to return

***

### offset?

> `optional` **offset?**: `number`

Defined in: [clients/ep/doceoClient.ts:83](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L83)

Pagination offset

***

### term?

> `optional` **term?**: `number`

Defined in: [clients/ep/doceoClient.ts:77](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L77)

Parliamentary term number (defaults to 10)

***

### weekStart?

> `optional` **weekStart?**: `string`

Defined in: [clients/ep/doceoClient.ts:75](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoClient.ts#L75)

Start of plenary week (Monday, YYYY-MM-DD). If omitted, uses most recent Monday.
