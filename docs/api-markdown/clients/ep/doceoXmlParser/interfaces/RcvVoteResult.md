[**European Parliament MCP Server API v1.3.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/doceoXmlParser](../README.md) / RcvVoteResult

# Interface: RcvVoteResult

Defined in: [clients/ep/doceoXmlParser.ts:31](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L31)

Parsed roll-call vote result from RCV XML.

## Properties

### abstentions

> **abstentions**: [`RcvMepVote`](RcvMepVote.md)[]

Defined in: [clients/ep/doceoXmlParser.ts:43](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L43)

MEPs who ABSTAINED

***

### corrections

> **corrections**: [`RcvMepVote`](RcvMepVote.md)[]

Defined in: [clients/ep/doceoXmlParser.ts:59](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L59)

MEPs listed in the Correction element (empty array if absent)

***

### description

> **description**: `string`

Defined in: [clients/ep/doceoXmlParser.ts:35](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L35)

Description/subject of the vote

***

### officialAbstentionCount

> **officialAbstentionCount**: `number`

Defined in: [clients/ep/doceoXmlParser.ts:57](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L57)

Official ABSTENTION count from Number attribute on Result.Abstention; falls back to MEP count

***

### officialAgainstCount

> **officialAgainstCount**: `number`

Defined in: [clients/ep/doceoXmlParser.ts:55](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L55)

Official AGAINST count from Number attribute on Result.Against; falls back to MEP count

***

### officialForCount

> **officialForCount**: `number`

Defined in: [clients/ep/doceoXmlParser.ts:53](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L53)

Official FOR count from Number attribute on Result.For; falls back to MEP count

***

### reference

> **reference**: `string`

Defined in: [clients/ep/doceoXmlParser.ts:37](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L37)

Reference (e.g., procedure reference like "A10-0123/2026")

***

### result

> **result**: `"ADOPTED"` \| `"REJECTED"`

Defined in: [clients/ep/doceoXmlParser.ts:45](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L45)

Intended result interpretation

***

### sittingDate

> **sittingDate**: `string`

Defined in: [clients/ep/doceoXmlParser.ts:47](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L47)

Sitting date from Date attribute on RollCallVote.Result (YYYY-MM-DD; empty string if absent)

***

### sittingNumber

> **sittingNumber**: `string`

Defined in: [clients/ep/doceoXmlParser.ts:49](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L49)

Sitting number from Number.Sitting attribute (empty string if absent)

***

### voteId

> **voteId**: `string`

Defined in: [clients/ep/doceoXmlParser.ts:33](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L33)

Vote number/identifier within the session

***

### votesAgainst

> **votesAgainst**: [`RcvMepVote`](RcvMepVote.md)[]

Defined in: [clients/ep/doceoXmlParser.ts:41](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L41)

MEPs who voted AGAINST

***

### votesFor

> **votesFor**: [`RcvMepVote`](RcvMepVote.md)[]

Defined in: [clients/ep/doceoXmlParser.ts:39](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L39)

MEPs who voted FOR

***

### voteType

> **voteType**: `string`

Defined in: [clients/ep/doceoXmlParser.ts:51](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L51)

Vote type from Type attribute on RollCallVote.Result (empty string if absent)
