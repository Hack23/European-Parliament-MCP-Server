[**European Parliament MCP Server API v1.3.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/doceoXmlParser](../README.md) / parseRcvXml

# Function: parseRcvXml()

> **parseRcvXml**(`xml`): [`RcvVoteResult`](../interfaces/RcvVoteResult.md)[]

Defined in: [clients/ep/doceoXmlParser.ts:335](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L335)

Parse a complete RCV XML document into structured vote results.

## Parameters

### xml

`string`

Raw XML string from RCV document

## Returns

[`RcvVoteResult`](../interfaces/RcvVoteResult.md)[]

Array of parsed roll-call vote results
