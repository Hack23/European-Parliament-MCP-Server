[**European Parliament MCP Server API v1.3.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/doceoXmlParser](../README.md) / votToLatestVotes

# Function: votToLatestVotes()

> **votToLatestVotes**(`votResults`, `date`, `term?`, `sourceUrl?`): [`LatestVoteRecord`](../interfaces/LatestVoteRecord.md)[]

Defined in: [clients/ep/doceoXmlParser.ts:636](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L636)

Convert parsed VOT results into LatestVoteRecord format.

## Parameters

### votResults

[`VotVoteResult`](../interfaces/VotVoteResult.md)[]

Parsed VOT vote results

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
