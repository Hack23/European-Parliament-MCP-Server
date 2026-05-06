[**European Parliament MCP Server API v1.3.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/doceoXmlParser](../README.md) / LatestVoteRecord

# Interface: LatestVoteRecord

Defined in: [clients/ep/doceoXmlParser.ts:97](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L97)

Combined latest votes result merging RCV and VOT data.

## Properties

### abstentions

> **abstentions**: `number`

Defined in: [clients/ep/doceoXmlParser.ts:113](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L113)

Total abstentions

***

### dataSource

> **dataSource**: `"RCV"` \| `"VOT"`

Defined in: [clients/ep/doceoXmlParser.ts:123](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L123)

Which XML document type provided the data

***

### date

> **date**: `string`

Defined in: [clients/ep/doceoXmlParser.ts:101](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L101)

Session date (YYYY-MM-DD)

***

### id

> **id**: `string`

Defined in: [clients/ep/doceoXmlParser.ts:99](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L99)

Unique vote identifier

***

### reference

> **reference**: `string`

Defined in: [clients/ep/doceoXmlParser.ts:107](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L107)

Document/procedure reference

***

### result

> **result**: `"ADOPTED"` \| `"REJECTED"`

Defined in: [clients/ep/doceoXmlParser.ts:115](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L115)

Vote outcome

***

### sourceUrl

> **sourceUrl**: `string`

Defined in: [clients/ep/doceoXmlParser.ts:121](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L121)

Source URL of the XML document

***

### subject

> **subject**: `string`

Defined in: [clients/ep/doceoXmlParser.ts:105](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L105)

Subject/description of the vote

***

### term

> **term**: `number`

Defined in: [clients/ep/doceoXmlParser.ts:103](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L103)

Parliamentary term number

***

### votesAgainst

> **votesAgainst**: `number`

Defined in: [clients/ep/doceoXmlParser.ts:111](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L111)

Total votes against

***

### votesFor

> **votesFor**: `number`

Defined in: [clients/ep/doceoXmlParser.ts:109](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L109)

Total votes in favor

***

### corrections?

> `optional` **corrections?**: [`RcvMepVote`](RcvMepVote.md)[]

Defined in: [clients/ep/doceoXmlParser.ts:133](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L133)

Vote corrections from RCV Correction element (optional)

***

### groupBreakdown?

> `optional` **groupBreakdown?**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, \{ `abstain`: `number`; `against`: `number`; `for`: `number`; \}\>

Defined in: [clients/ep/doceoXmlParser.ts:119](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L119)

Political group breakdown of votes

***

### mepVotes?

> `optional` **mepVotes?**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `"FOR"` \| `"AGAINST"` \| `"ABSTAIN"`\>

Defined in: [clients/ep/doceoXmlParser.ts:117](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L117)

Individual MEP votes (from RCV data, keyed by mepId)

***

### officialCounts?

> `optional` **officialCounts?**: `object`

Defined in: [clients/ep/doceoXmlParser.ts:131](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L131)

Official counts from XML Number/For/Against/Abst attributes (optional)

#### abstentions

> **abstentions**: `number`

#### against

> **against**: `number`

#### for

> **for**: `number`

***

### sittingDate?

> `optional` **sittingDate?**: `string`

Defined in: [clients/ep/doceoXmlParser.ts:127](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L127)

Sitting date from RCV data (YYYY-MM-DD; optional)

***

### sittingNumber?

> `optional` **sittingNumber?**: `string`

Defined in: [clients/ep/doceoXmlParser.ts:129](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L129)

Sitting number from RCV data (optional)

***

### voteType?

> `optional` **voteType?**: `string`

Defined in: [clients/ep/doceoXmlParser.ts:125](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L125)

Vote type from the XML Type attribute (optional)
