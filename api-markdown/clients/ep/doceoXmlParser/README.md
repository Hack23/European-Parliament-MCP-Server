[**European Parliament MCP Server API v1.3.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / clients/ep/doceoXmlParser

# clients/ep/doceoXmlParser

## Fileoverview

XML parser for European Parliament DOCEO vote documents

Parses two types of EP plenary vote XML documents:
- **RCV** (Roll-Call Votes): Individual MEP voting positions by political group
- **VOT** (Vote Results): Aggregate vote results with subject descriptions

XML source: `https://www.europarl.europa.eu/doceo/document/PV-{term}-{date}-{type}_EN.xml`

## Security

Input sanitization applied to all parsed XML text content

## Interfaces

- [LatestVoteRecord](interfaces/LatestVoteRecord.md)
- [RcvMepVote](interfaces/RcvMepVote.md)
- [RcvVoteResult](interfaces/RcvVoteResult.md)
- [VotVoteResult](interfaces/VotVoteResult.md)

## Variables

- [CURRENT\_PARLIAMENTARY\_TERM](variables/CURRENT_PARLIAMENTARY_TERM.md)
- [DOCEO\_BASE\_URL](variables/DOCEO_BASE_URL.md)

## Functions

- [buildDoceoUrl](functions/buildDoceoUrl.md)
- [getPlenaryWeekDates](functions/getPlenaryWeekDates.md)
- [parseRcvXml](functions/parseRcvXml.md)
- [parseVotXml](functions/parseVotXml.md)
- [rcvToLatestVotes](functions/rcvToLatestVotes.md)
- [votToLatestVotes](functions/votToLatestVotes.md)
