[**European Parliament MCP Server API v1.3.13**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/doceoXmlParser](../README.md) / rcvToLatestVotes

# Function: rcvToLatestVotes()

> **rcvToLatestVotes**(`rcvResults`, `date`, `term?`, `sourceUrl?`): [`LatestVoteRecord`](../interfaces/LatestVoteRecord.md)[]

Defined in: [clients/ep/doceoXmlParser.ts:570](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L570)

Convert parsed RCV results into LatestVoteRecord format.

## Parameters

### rcvResults

[`RcvVoteResult`](../interfaces/RcvVoteResult.md)[]

Parsed RCV vote results

### date

`string`

Session date

### term?

`number` = `CURRENT_PARLIAMENTARY_TERM`

Parliamentary term

### sourceUrl?

`string` = `''`

Source XML URL

## Returns

[`LatestVoteRecord`](../interfaces/LatestVoteRecord.md)[]

Array of LatestVoteRecord
