[**European Parliament MCP Server API v1.3.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/doceoXmlParser](../README.md) / parseVotXml

# Function: parseVotXml()

> **parseVotXml**(`xml`): [`VotVoteResult`](../interfaces/VotVoteResult.md)[]

Defined in: [clients/ep/doceoXmlParser.ts:449](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L449)

Parse a VOT (Vote Results) XML document into structured results.

Tries Table/Row format first (newer EP DOCEO format), then falls back
to Vote.Result / Result element format.

## Parameters

### xml

`string`

Raw XML string from VOT document

## Returns

[`VotVoteResult`](../interfaces/VotVoteResult.md)[]

Array of parsed aggregate vote results
