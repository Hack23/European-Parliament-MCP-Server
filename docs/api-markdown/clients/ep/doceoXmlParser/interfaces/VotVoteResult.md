[**European Parliament MCP Server API v1.3.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/doceoXmlParser](../README.md) / VotVoteResult

# Interface: VotVoteResult

Defined in: [clients/ep/doceoXmlParser.ts:65](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L65)

Parsed vote result from VOT XML (aggregate format).

## Properties

### abstentions

> **abstentions**: `number`

Defined in: [clients/ep/doceoXmlParser.ts:77](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L77)

Number of abstentions

***

### itemNumber

> **itemNumber**: `string`

Defined in: [clients/ep/doceoXmlParser.ts:67](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L67)

Vote item number

***

### officialAbstentionCount

> **officialAbstentionCount**: `number`

Defined in: [clients/ep/doceoXmlParser.ts:91](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L91)

Official ABSTENTION count from Abst attribute on Result.Group (0 if absent)

***

### officialAgainstCount

> **officialAgainstCount**: `number`

Defined in: [clients/ep/doceoXmlParser.ts:89](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L89)

Official AGAINST count from Against attribute on Result.Group (0 if absent)

***

### officialForCount

> **officialForCount**: `number`

Defined in: [clients/ep/doceoXmlParser.ts:87](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L87)

Official FOR count from For attribute on Result.Group (0 if absent)

***

### reference

> **reference**: `string`

Defined in: [clients/ep/doceoXmlParser.ts:71](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L71)

Document reference

***

### result

> **result**: `"ADOPTED"` \| `"REJECTED"`

Defined in: [clients/ep/doceoXmlParser.ts:79](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L79)

Vote outcome

***

### rowType

> **rowType**: `string`

Defined in: [clients/ep/doceoXmlParser.ts:85](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L85)

Row/Vote.Result Type attribute value (empty string if absent)

***

### subject

> **subject**: `string`

Defined in: [clients/ep/doceoXmlParser.ts:69](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L69)

Subject/title of the vote

***

### tableTitle

> **tableTitle**: `string`

Defined in: [clients/ep/doceoXmlParser.ts:83](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L83)

Title of the parent Table element (empty string if absent)

***

### votesAgainst

> **votesAgainst**: `number`

Defined in: [clients/ep/doceoXmlParser.ts:75](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L75)

Number of votes against

***

### votesFor

> **votesFor**: `number`

Defined in: [clients/ep/doceoXmlParser.ts:73](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L73)

Number of votes in favor

***

### voteType

> **voteType**: `string`

Defined in: [clients/ep/doceoXmlParser.ts:81](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L81)

Vote type (e.g., "single", "split", "separate", "amendment")
